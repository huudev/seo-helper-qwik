import { component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { getValues, required, useForm } from '@modular-forms/qwik';
import { searchDefault, searchGoogle } from '~/common/search.service';
import { SEARCH_EXCLUSION_LIST, getSetting } from '~/common/settings.service';
import { termToSentences } from '~/common/util.service';

type SearchForm = {
  term: string;
  excludeSites: string[];
};

export default component$(() => {
  const [searchForm, { Form, Field }] = useForm({
    loader: useSignal<SearchForm>({ term: '', excludeSites: [] }),
    validateOn: 'touched',
  });
  const state = useStore({ searchExclusionList: [] as string[] })
  useVisibleTask$(async () => {
    state.searchExclusionList = await getSetting(SEARCH_EXCLUSION_LIST)
  })
  return (
    <>
      <Form>
        <Field
          name="term"
          validate={[required('Vui lòng nhập')]}
        >
          {(field, props) => (
            <div class="mt-3">
              <label for="term" class="form-label">Điều kiện <span class="text-danger">*</span></label>
              <textarea {...props} class={["form-control", { 'is-invalid': (searchForm.submitted || field.touched) && field.error, 'is-valid': (searchForm.submitted || field.touched) && !field.error }]} id="term" value={field.value} rows={8} required></textarea>
              {field.error && <div class="invalid-feedback">{field.error}</div>}
            </div>
          )}
        </Field>
        <div class="d-flex mt-3 gap-3">
          <button class="btn btn-primary" onClick$={() => {
            if (searchForm.invalid) {
              return;
            }
            const e = getValues(searchForm)
            searchGoogle(termToSentences(e.term!), e.excludeSites)
          }} disabled={!searchForm.touched || searchForm.invalid}>Tìm kiếm google</button>
          <button class="btn btn-success" onClick$={() => {
            if (searchForm.invalid) {
              return;
            }
            const e = getValues(searchForm)
            searchDefault(termToSentences(e.term!))
          }} disabled={!searchForm.touched || searchForm.invalid}>Tìm kiếm mặc định</button>
        </div>
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
