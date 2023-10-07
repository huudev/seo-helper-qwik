import { component$, Slot } from '@builder.io/qwik';
import { Link, useLocation, type RequestHandler, useContent } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  const loc = useLocation()
  const content = useContent()
  return <div>
    <div class="d-flex justify-content-between">
      <ul class="nav nav-underline">
        {content.menu?.items?.map(i => <li key={i.href} class="nav-item">
          <Link href={i.href} class={["nav-link", { "active": i.href == loc.url.pathname }]}>
            {i.text}
          </Link>
        </li>)}
      </ul>
      <button title="Mở cửa sổ" type="button" class="btn btn-light" onClick$={() => {
        let url = location.href;
        const indexPath = '/index.html'
        if (!url.endsWith(indexPath)) {
          url += indexPath;
        }

        chrome.windows.create({
          url,
          type: "normal",
          focused: true,
          setSelfAsOpener: true,
        });
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fullscreen" viewBox="0 0 16 16">
          <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
        </svg>
      </button>

    </div>
    <Slot />
  </div>;
});
