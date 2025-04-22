import os 
import json 
import requests
from datetime import datetime
import pandas as pd

OFF_PEAK_RATE_WINTER = 0.37
PEAK_RATE_WINTER = 0.4

def get_ei_response(payload, ei_api_key=os.getenv("EIAPI_DEV_API_KEY")):     
    url = "https://ei.palmetto.com/api/v0/bem/calculate"
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "X-API-Key": ei_api_key
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.text

def get_customer_payload(address: str, start_time: str, end_time: str, granularity: str, usage_dict: dict, baseline_params: dict):
    customer_payload = {
        "parameters": {
            "from_datetime": start_time,
            "to_datetime": end_time,
            "variables": ["consumption.electricity.refrigerator", 
                        "consumption.electricity.cooking_range", 
                        "consumption.electricity.dishwasher", 
                        "consumption.electricity.ceiling_fan", 
                        "consumption.electricity.plug_loads", 
                        "consumption.electricity.lighting", 
                        "consumption.electricity.heating", 
                        "consumption.electricity.cooling", 
                        "consumption.fossil_fuel.hot_water", 
                        "consumption.electricity", 
                        "consumption.fossil_fuel"],
            "group_by": granularity
        },
        "location": {
            "address": address
        }
    }
    if usage_dict:
        customer_payload["consumption"] = {
            "actuals": usage_dict
        }
    if baseline_params and usage_dict:
        customer_payload["consumption"]["attributes"] = {
            'baseline': baseline_params if isinstance(baseline_params, list) else [
                baseline_params]
        }
    elif baseline_params:
        customer_payload["consumption"] = {
            "attributes": {
                'baseline': baseline_params if isinstance(baseline_params, list) else [
                    baseline_params]
            }
        }

    return customer_payload

def generate_heater_params(start_time: int, duration: int, setpoint: int):
    """Generate baseline heating setpoints.

    Args:
        start_time (int): Start hour in 24-hour format (0-23).
        duration (int): How long the heater is on for.
        setpoint (int): Heating setpoint in Celsius.
    """
    value = [10] * 24
    for i in range(start_time, start_time + duration):
        value[i % 24] = setpoint

    return {
        "name": "hvac_heating_setpoint",
        "value": value
    }

def generate_cooling_params(start_time: int, duration: int, setpoint: int):
    """generate baseline cooling setpoints

    Args:
        start_time (int): start hour in 24 hour format
        0-23
        duration (int): How long the heater is on for
    """
    value = [38] * 24
    for i in range(start_time, start_time + duration):
        value[i % 24] = setpoint
        
    return {
        "name": "hvac_cooling_setpoint",
        "value": value
    }

def parse_to_df(json_string, attribute_list=[]):
    parsed = json.loads(json_string)
    df = pd.DataFrame.from_records(parsed['data']['intervals'])
    df['from_datetime'] = pd.to_datetime(df['from_datetime'])
    df['to_datetime'] = pd.to_datetime(df['to_datetime'])
    return df.pivot(index='from_datetime', columns='variable', values='value')

def df_from_address(address, start_time, end_time, granularity, known_usage_dict=None, baseline_params=None):
    payload = get_customer_payload(address, start_time, end_time, granularity, known_usage_dict, baseline_params)
    ei_response = get_ei_response(payload)
    df = parse_to_df(ei_response)
    return df

def calculate_costs(df, off_peak_rate, peak_rate):
    df = df.copy()
    df['cost'] = 0.
    df.loc[(df.index.hour <= 15) | (df.index.hour > 21), 'cost'] = df['consumption.electricity'] * off_peak_rate
    df.loc[(df.index.hour > 15) & (df.index.hour <= 21), 'cost'] = df['consumption.electricity'] * peak_rate
    return df

def compare_monthly_costs(baseline_costs: pd.Series, action_costs: pd.Series) -> pd.DataFrame:
    """
    Compares baseline and action cost series by calculating monthly totals and savings.

    Args:
        baseline_costs (pd.Series): Baseline cost series with datetime index.
        action_costs (pd.Series): Action (shifted) cost series with datetime index.

    Returns:
        pd.DataFrame: DataFrame with columns for month_year, baseline_cost, action_cost, and action_savings.
    """
    # Ensure datetime index
    baseline_costs.index = pd.to_datetime(baseline_costs.index)
    action_costs.index = pd.to_datetime(action_costs.index)

    # Group by month and sum
    baseline_monthly = baseline_costs.groupby(baseline_costs.index.to_period("M")).sum()
    action_monthly = action_costs.groupby(action_costs.index.to_period("M")).sum()

    # Combine and calculate savings
    comparison = pd.DataFrame({
        "baseline_cost": baseline_monthly,
        "action_cost": action_monthly
    })
    comparison["action_savings"] = comparison["baseline_cost"] - comparison["action_cost"]

    # Reset index and handle month labels
    comparison = comparison.reset_index()
    comparison.rename(columns={comparison.columns[0]: "month_period"}, inplace=True)
    comparison["month_year"] = comparison["month_period"].dt.strftime("%Y-%m")
    comparison = comparison.drop(columns="month_period")

    return comparison[["month_year", "baseline_cost", "action_cost", "action_savings"]]


# Baseline Example: passing no known billed usage months
# address = "929 Maxwell Ave. Boulder, CO 80304"
address = "1065 Evelyn Ave. Albany, CA 94706"

base_heating_data = generate_heater_params(0, 24, 21)
base_cooling_data = generate_cooling_params(0, 24, 23)
base_hvac_params = [base_heating_data, base_cooling_data]
shift_heating_data = generate_heater_params(8, 3, 21)
shift_cooling_data = generate_cooling_params(8, 3, 23)
shift_hvac_params = [shift_heating_data, shift_cooling_data]

# baseline cost
baseline = df_from_address(address, "2023-01-01T00:00:00", "2024-01-01T00:00:00", "hour", None, base_hvac_params)
baseline = calculate_costs(baseline, OFF_PEAK_RATE_WINTER, PEAK_RATE_WINTER)
baseline = baseline.reset_index()

# shift cost
shifted = df_from_address(address, "2023-01-01T00:00:00", "2024-01-01T00:00:00", "hour", None, shift_hvac_params)
shifted = calculate_costs(shifted, OFF_PEAK_RATE_WINTER, PEAK_RATE_WINTER)
shifted = shifted.reset_index()

# Compare monthly costs
monthly_summary = compare_monthly_costs(
    baseline_costs=baseline.set_index("from_datetime")["cost"],
    action_costs=shifted.set_index("from_datetime")["cost"]
)

# Print results
print(monthly_summary)