import { sharedApiClient } from './shared-api-client.js';

describe('sharedApiClient', () => {
  it('should work', () => {
    expect(sharedApiClient()).toEqual('shared-api-client');
  });
});
