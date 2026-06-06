Component({
  options: {
    styleIsolation: 'shared',
  },
  properties: {
    snapOffset: {
      type: Number,
      value: 0,
    },
    actionWidth: {
      type: Number,
      value: 80,
    },
    unread: {
      type: Boolean,
      value: false,
    },
    peerName: {
      type: String,
      value: '',
    },
    lastMessage: {
      type: String,
      value: '',
    },
    timeLabel: {
      type: String,
      value: '',
    },
    badgeLabel: {
      type: String,
      value: '',
    },
    avatarStyle: {
      type: String,
      value: '',
    },
  },
  methods: {
    handleSwipeEnd(detail) {
      this.triggerEvent('swipeend', detail);
    },
    handleSwipeClose() {
      this.triggerEvent('swipeclose', {});
    },
    handleOpen() {
      this.triggerEvent('open', {});
    },
    onDeleteTap() {
      this.triggerEvent('delete', {});
    },
  },
});
