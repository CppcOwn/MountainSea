export default {
  pages: [
    'pages/index/index',
    'pages/wonder-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1890ff',
    navigationBarTitleText: '中国文旅地球仪',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#666',
    selectedColor: '#1890ff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tab-home.png',
        selectedIconPath: 'assets/tab-home-active.png'
      },
      {
        pagePath: 'pages/wonder-detail/index',
        text: '自然奇观',
        iconPath: 'assets/tab-wonder.png',
        selectedIconPath: 'assets/tab-wonder-active.png'
      }
    ]
  },
  networkTimeout: {
    request: 10000,
    downloadFile: 10000
  },
  debug: false,
  functionalPages: false,
  subPackages: [],
  mainPackage: {},
  requiredBackgroundModes: [],
  permissions: {
    'scope.userLocation': {
      desc: '用于获取当前位置，推荐附近的景区'
    }
  },
  plugins: {},
  preloadRule: {},
  resizable: false,
  navigateToMiniProgramAppIdList: [],
  entranceDeclare: {
    subscribeMessage: {
      templateId: [],
      scene: 'enterFromMiniProgram'
    }
  },
  components: ['components/EarthGlobe/index']
}
