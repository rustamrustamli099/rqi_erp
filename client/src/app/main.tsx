import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/shared/lib/queryClient'
import '@/index.css'
import App from './App'
import { store } from '@/store'
import { Provider } from 'react-redux'
import '@/i18n'

import { Toaster } from 'sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            {/* <React.StrictMode> */}
            <Provider store={store}>
                <App />
                <Toaster richColors position="top-center" />
            </Provider>
            {/* </React.StrictMode> */}
        </QueryClientProvider>
    </React.StrictMode>,
)
