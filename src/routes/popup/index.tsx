import { component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { required, useForm } from '@modular-forms/qwik';
import { searchGoogle } from '~/common/search-google.service';
import { SEARCH_EXCLUSION_LIST, getSetting } from '~/common/settings.service';

type SearchForm = {
  term: string;
  excludeSites: string[];
};

export default component$(() => {
  const [searchForm, { Form, Field }] = useForm<SearchForm>({
    loader: useSignal({ term: '', excludeSites: [] }),
  });
  const state = useStore({ searchExclusionList: [] as string[] })
  useVisibleTask$(async () => {
    state.searchExclusionList = await getSetting(SEARCH_EXCLUSION_LIST)
  })
  return (
    <>
      <Form onSubmit$={e => {
        searchGoogle(e.term, e.excludeSites)
      }}>
        <Field
          name="term"
          validate={[required('Vui lòng nhập')]}
        >
          {(field, props) => (
            <div class={[{ 'was-validated': searchForm.submitted }]}>
              <label for="term" class="form-label">Điều kiện:</label>
              <textarea {...props} class="form-control" id="term" value={field.value} rows={8} required></textarea>
              {field.error && <div class="invalid-feedback">{field.error}</div>}
            </div>
          )}
        </Field>
        <button class="btn btn-primary mt-3">Tìm kiếm</button>
        <br />
        <label class="mt-3 form-label">Danh sách loại trừ:</label>
        <div class="d-flex gap-3">
          {state.searchExclusionList.map(s => (
            <Field key={s} name="excludeSites" type="string[]">
              {(field, props) => (
                <div class="form-check">
                  <input {...props} class="form-check-input" type="checkbox" value={s} id="excludeSites" checked={field.value?.includes(s)} />
                  <label class="form-check-label" for="excludeSites">
                    {s}
                  </label>
                </div>
              )}
            </Field>
          ))}
        </div>
      </Form >
    </>
  );
});

export const head: DocumentHead = {
  title: 'Tìm kiếm'
};
