import { render } from '@testing-library/react';

import IamFeatureRegister from './iam-feature-register';

describe('IamFeatureRegister', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<IamFeatureRegister />);
    expect(baseElement).toBeTruthy();
  });
});
