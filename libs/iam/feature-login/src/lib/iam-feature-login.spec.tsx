import { render } from '@testing-library/react';

import IamFeatureLogin from './iam-feature-login';

describe('IamFeatureLogin', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<IamFeatureLogin />);
    expect(baseElement).toBeTruthy();
  });
});
