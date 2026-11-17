import type { OpenSlideConfig } from '@open-slide/core';

const openSlideConfig: OpenSlideConfig = {
  base: '/investor-memo/',
  build: {
    showSlideBrowser: false,
    showSlideUi: true,
    allowHtmlDownload: false,
  },
};

export default openSlideConfig;
