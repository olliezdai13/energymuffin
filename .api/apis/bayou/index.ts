import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'bayou/1.0.0 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Uploads a new bill to parse it
   *
   * @summary Upload New Bill
   * @throws FetchError<400, types.PostBillsResponse400> Bad Request
   * @throws FetchError<404, types.PostBillsResponse404> Not Found
   * @throws FetchError<409, types.PostBillsResponse409> Conflict
   * @throws FetchError<415, types.PostBillsResponse415> Unsupported Media Type
   */
  postBills(body: types.PostBillsBodyParam): Promise<FetchResponse<200, types.PostBillsResponse200>> {
    return this.core.fetch('/bills', 'post', body);
  }

  /**
   * Creates a new customer account
   *
   * @summary Create New Customer
   * @throws FetchError<400, types.PostCustomersResponse400> Bad Request
   * @throws FetchError<409, types.PostCustomersResponse409> Conflict
   */
  postCustomers(body: types.PostCustomersBodyParam): Promise<FetchResponse<201, types.PostCustomersResponse201>> {
    return this.core.fetch('/customers', 'post', body);
  }

  /**
   * Retrieves a list of customer accounts associated with your company
   *
   * @summary Get List of Customers
   */
  getCustomers(): Promise<FetchResponse<200, types.GetCustomersResponse200>> {
    return this.core.fetch('/customers', 'get');
  }

  /**
   * Retrieves a customer account
   *
   * @summary Get Customer by ID
   * @throws FetchError<404, types.GetCustomersIdResponse404> Not Found
   */
  getCustomersId(metadata: types.GetCustomersIdMetadataParam): Promise<FetchResponse<200, types.GetCustomersIdResponse200>> {
    return this.core.fetch('/customers/{id}', 'get', metadata);
  }

  /**
   * Updates a customer account
   *
   * @summary Update Customer by ID
   * @throws FetchError<400, types.PatchCustomersIdResponse400> Bad Request
   * @throws FetchError<404, types.PatchCustomersIdResponse404> Not Found
   * @throws FetchError<409, types.PatchCustomersIdResponse409> Conflict
   */
  patchCustomersId(body: types.PatchCustomersIdBodyParam, metadata: types.PatchCustomersIdMetadataParam): Promise<FetchResponse<200, types.PatchCustomersIdResponse200>> {
    return this.core.fetch('/customers/{id}', 'patch', body, metadata);
  }

  /**
   * Retrieves the customer account bills
   *
   * @summary Get Bills by Customer ID
   * @throws FetchError<400, types.GetCustomersCustomerIdBillsResponse400> Bad Request
   * @throws FetchError<404, types.GetCustomersCustomerIdBillsResponse404> Not Found
   */
  getCustomersCustomer_idBills(metadata: types.GetCustomersCustomerIdBillsMetadataParam): Promise<FetchResponse<200, types.GetCustomersCustomerIdBillsResponse200>> {
    return this.core.fetch('/customers/{customer_id}/bills', 'get', metadata);
  }

  /**
   * Retrieves a specific utility bill
   *
   * @summary Get Bill by ID
   * @throws FetchError<404, types.GetBillsIdResponse404> Not Found
   */
  getBillsId(metadata: types.GetBillsIdMetadataParam): Promise<FetchResponse<200, types.GetBillsIdResponse200>> {
    return this.core.fetch('/bills/{id}', 'get', metadata);
  }

  /**
   * Updates a specific utility bill
   *
   * @summary Update Bill by ID
   * @throws FetchError<404, types.PatchBillsIdResponse404> Not Found
   * @throws FetchError<409, types.PatchBillsIdResponse409> Conflict
   */
  patchBillsId(body: types.PatchBillsIdBodyParam, metadata: types.PatchBillsIdMetadataParam): Promise<FetchResponse<200, types.PatchBillsIdResponse200>> {
    return this.core.fetch('/bills/{id}', 'patch', body, metadata);
  }

  /**
   * Unlocks a specific utility bill
   *
   * @summary Unlock Bill by ID
   * @throws FetchError<404, types.PostBillsIdUnlockResponse404> Not Found
   */
  postBillsIdUnlock(metadata: types.PostBillsIdUnlockMetadataParam): Promise<FetchResponse<200, types.PostBillsIdUnlockResponse200>> {
    return this.core.fetch('/bills/{id}/unlock', 'post', metadata);
  }

  /**
   * Retrieves the list of intervals for that customer
   *
   * @summary Get Intervals by Customer ID
   * @throws FetchError<400, types.GetCustomersCustomerIdIntervalsResponse400> Bad Request
   * @throws FetchError<404, types.GetCustomersCustomerIdIntervalsResponse404> Not Found
   */
  getCustomersCustomer_idIntervals(metadata: types.GetCustomersCustomerIdIntervalsMetadataParam): Promise<FetchResponse<200, types.GetCustomersCustomerIdIntervalsResponse200>> {
    return this.core.fetch('/customers/{customer_id}/intervals', 'get', metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { GetBillsIdMetadataParam, GetBillsIdResponse200, GetBillsIdResponse404, GetCustomersCustomerIdBillsMetadataParam, GetCustomersCustomerIdBillsResponse200, GetCustomersCustomerIdBillsResponse400, GetCustomersCustomerIdBillsResponse404, GetCustomersCustomerIdIntervalsMetadataParam, GetCustomersCustomerIdIntervalsResponse200, GetCustomersCustomerIdIntervalsResponse400, GetCustomersCustomerIdIntervalsResponse404, GetCustomersIdMetadataParam, GetCustomersIdResponse200, GetCustomersIdResponse404, GetCustomersResponse200, PatchBillsIdBodyParam, PatchBillsIdMetadataParam, PatchBillsIdResponse200, PatchBillsIdResponse404, PatchBillsIdResponse409, PatchCustomersIdBodyParam, PatchCustomersIdMetadataParam, PatchCustomersIdResponse200, PatchCustomersIdResponse400, PatchCustomersIdResponse404, PatchCustomersIdResponse409, PostBillsBodyParam, PostBillsIdUnlockMetadataParam, PostBillsIdUnlockResponse200, PostBillsIdUnlockResponse404, PostBillsResponse200, PostBillsResponse400, PostBillsResponse404, PostBillsResponse409, PostBillsResponse415, PostCustomersBodyParam, PostCustomersResponse201, PostCustomersResponse400, PostCustomersResponse409 } from './types';
