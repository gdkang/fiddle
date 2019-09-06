import { shallow } from 'enzyme';
import * as React from 'react';
import { BisectHandler } from '../../../src/renderer/components/commands-bisect';

describe('Bisect commands component', () => {
  let store: any;

  beforeEach(() => {
    store = {
      bisectInstance: {
        continue: jest.fn(),
        getCurrentVersion: jest.fn()
      },
      setVersion: jest.fn(),
      version: '1.0.0'
    };
  });

  it('renders helper buttons if bisect instance is active', () => {
    const wrapper = shallow(<BisectHandler appState={store} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders bisect dialog button if no bisect instance', () => {
    delete store.bisectInstance;
    const wrapper = shallow(<BisectHandler appState={store} />);
    expect(wrapper).toMatchSnapshot();
  });

  describe('continueBisect()', () => {
    it('sets version assigned by bisect algorithm', () => {
      const wrapper = shallow(<BisectHandler appState={store} />);
      const instance: BisectHandler = wrapper.instance() as any;

      store.bisectInstance.continue.mockReturnValue({
        version: '2.0.0'
      });
      instance.continueBisect(true);
      expect(store.setVersion).toHaveBeenCalledWith('2.0.0');
    });

    it('terminates bisect if algorithm returns current version', () => {
      const wrapper = shallow(<BisectHandler appState={store} />);
      const instance: BisectHandler = wrapper.instance() as any;
      instance.terminateBisect = jest.fn();

      // same value is only returned when there is only 1 version left
      store.bisectInstance.continue.mockReturnValue({
        version: '1.0.0'
      });
      instance.continueBisect(true);
      expect(store.setVersion).not.toHaveBeenCalled();
      expect(instance.terminateBisect).toHaveBeenCalled();
    });
  });

  describe('terminateBisect()', () => {
    it('removes the bisect instance from the app state', () => {
      const wrapper = shallow(<BisectHandler appState={store} />);
      const instance: BisectHandler = wrapper.instance() as any;

      instance.terminateBisect();
      expect(store.bisectInstance).toBeUndefined();
    });
  });
});
