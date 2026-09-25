import { render } from '@testing-library/react';

import UiPrimitives from './ui-primitives';

describe('UiPrimitives', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiPrimitives />);
    expect(baseElement).toBeTruthy();
  });
});
