import React from 'react';
import { RouterProvider } from 'react-router-dom';

import { router } from './routing/Routes';

export default function App() {
  return <RouterProvider router={router} />;
}
