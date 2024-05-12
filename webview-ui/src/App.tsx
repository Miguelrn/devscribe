import { ThemeProvider } from '@emotion/react';
import './App.css'
// import '@fontsource/roboto/300.css';
// import '@fontsource/roboto/400.css';
// import '@fontsource/roboto/500.css';
// import '@fontsource/roboto/700.css';
import Chat from './components/Chat';
import theme from './theme';


function App() {

  return (
    <ThemeProvider theme={theme}>
      <Chat></Chat>
    </ThemeProvider>
  )
}

export default App
