import { useEffect } from 'react';
import './App.css';
import MainLayout from './layout/mainlayout';
import { initJuno } from '@junobuild/core';

const App = () => {
  useEffect(() => {
    (async () =>
      await initJuno({
        satelliteId: "h4wtk-qqaaa-aaaal-adska-cai",
      }))();
  }, []);

  return (
    <MainLayout />
  );
}

export default App;
