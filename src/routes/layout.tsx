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
    <ul class="nav nav-underline">
      {content.menu?.items?.map(i => <li key={i.href} class="nav-item">
        <Link href={i.href} class={["nav-link", { "active": i.href == loc.url.pathname }]}>
          {i.text}
        </Link>
      </li>)}
    </ul>
    <Slot />
  </div>;
});
