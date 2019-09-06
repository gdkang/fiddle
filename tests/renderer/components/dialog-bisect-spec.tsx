import { shallow } from 'enzyme';
import * as React from 'react';
import { ElectronVersionSource, ElectronVersionState } from '../../../src/interfaces';
import { BisectInstance } from '../../../src/renderer/bisect';
import { BisectDialog } from '../../../src/renderer/components/dialog-bisect';
import { ElectronReleaseChannel } from '../../../src/renderer/versions';

jest.mock('../../../src/renderer/bisect');

describe('BisectDialog component', () => {
  let store: any;

  const generateVersionRange = (rangeLength: number) =>
    (new Array(rangeLength)).fill(0).map((_, i) => ({
      state: ElectronVersionState.ready,
      version: `${i + 1}.0.0`,
      source: ElectronVersionSource.local
    }));

  beforeEach(() => {
    store = {
      versions: generateVersionRange(5),
      versionsToShow: [ElectronReleaseChannel.stable],
      statesToShow: [ElectronVersionState.ready],
      setVersion: jest.fn()
    };
  });

  it('renders', () => {
    const wrapper = shallow(<BisectDialog appState={store} />);
    // start and end selected
    wrapper.setState({
      startIndex: 1,
      endIndex: 3,
      allVersion: generateVersionRange(5)
    });
    expect(wrapper).toMatchSnapshot();

    // no selection
    wrapper.setState({
      startIndex: undefined,
      endIndex: undefined,
      allVersion: generateVersionRange(5)
    });
    expect(wrapper).toMatchSnapshot();

    // only start selected
    wrapper.setState({
      startIndex: 1,
      endIndex: undefined,
      allVersion: generateVersionRange(5)
    });
    expect(wrapper).toMatchSnapshot();
  });

  describe('onBeginSelect()', () => {
    it('sets the begin version', () => {
      const wrapper = shallow(<BisectDialog appState={store} />);
      const instance: BisectDialog = wrapper.instance() as any;

      expect(instance.state.startIndex).toBeUndefined();
      instance.onBeginSelect(store.versions[2]);
      expect(instance.state.startIndex).toBe(2);
    });
  });

  describe('onEndSelect()', () => {
    it('sets the end version', () => {
      const wrapper = shallow(<BisectDialog appState={store} />);
      const instance: BisectDialog = wrapper.instance() as any;

      expect(instance.state.endIndex).toBeUndefined();
      instance.onEndSelect(store.versions[2]);
      expect(instance.state.endIndex).toBe(2);
    });
  });

  describe('onSubmit()', () => {
    it('initiates a bisect instance and sets a version', async () => {
      const version = '1.0.0';
      (BisectInstance as jest.Mock).mockImplementation(() => {
        return {
          getCurrentVersion: () => ({ version })
        };
      });

      const wrapper = shallow(<BisectDialog appState={store} />);
      wrapper.setState({
        startIndex: 1,
        endIndex: 3,
        allVersion: generateVersionRange(5)
      });

      const instance: BisectDialog = wrapper.instance() as any;
      await instance.onSubmit();
      expect(store.bisectInstance).toBeDefined();
      expect(store.setVersion).toHaveBeenCalledWith(version);
    });
  });
});
