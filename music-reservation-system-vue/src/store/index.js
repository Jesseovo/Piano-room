import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('token') || '',
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    basicSettings: localStorage.getItem('basicSettings') ? JSON.parse(localStorage.getItem('basicSettings')) : null
  },
  getters: {
    isLoggedIn: state => !!state.token,
    currentUser: state => state.user,
    isAdmin: state => state.user && state.user.userType === 'admin',
    basicSettings: state => state.basicSettings
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    LOGOUT(state) {
      state.token = '';
      state.user = null;
    },
    SET_BASIC_SETTINGS(state, basicSettings) {
      state.basicSettings = basicSettings;
    }
  },
  actions: {

    // 保存基础设置
    saveBasicSettings({ commit }, basicSettings) {
      localStorage.setItem('basicSettings', JSON.stringify(basicSettings));
      commit('SET_BASIC_SETTINGS', basicSettings);
    },

    // 保存登录信息
    saveAuth({ commit }, { token, user }) {
      // 保存到 localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // 保存到 Vuex
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
    },
    
    // 更新用户信息
    updateUser({ commit }, user) {
      localStorage.setItem('user', JSON.stringify(user));
      commit('SET_USER', user);
    },
    
    // 退出登录
    logout({ commit }) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      commit('LOGOUT');
    }
  },
  modules: {
  }
})
