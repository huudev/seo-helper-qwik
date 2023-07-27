import { component$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head/router-head';

// import 'bootstrap/dist/css/bootstrap.min.css';
import './bootstrap.css'
import './global.css';

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <RouterHead />
      </head>
      <body lang="en" style="min-width: 600px;height: 400px;margin: 0">
        <div class="p-2">
          <RouterOutlet />
        </div>
      </body>
    </QwikCityProvider>
  );
});
