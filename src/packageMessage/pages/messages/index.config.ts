import { PAGE_WINDOW_DARK } from '../../../config/pageWindow';

export default {
  navigationBarTitleText: '',
  navigationStyle: 'custom',
  disableScroll: true,
  usingComponents: {
    'swipe-delete-row': '../../components/swipe-delete-row/index',
  },
  ...PAGE_WINDOW_DARK,
};
