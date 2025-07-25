import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store, persistor } from './redux/Store';
import AppRoutes from './routes/AppRoutes';

import { PersistGate } from 'redux-persist/integration/react';
const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
          <AppRoutes />
      </ConfigProvider>
    </PersistGate>
  </Provider>
);

export default App;