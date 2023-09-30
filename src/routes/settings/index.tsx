import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { insert, remove, required, setValues, useForm } from '@modular-forms/qwik';
import { SEARCH_EXCLUSION_LIST, getSetting, setSetting } from '~/common/settings.service';

type SettingsForm = {
    searchExclusionList: string[];
};

export default component$(() => {
    const [settingsForm, { Form, Field, FieldArray }] = useForm({
        loader: useSignal<SettingsForm>({ searchExclusionList: [] }),
        validateOn: 'touched',
        fieldArrays: ['searchExclusionList']
    });
    useVisibleTask$(async () => {
        const list = await getSetting(SEARCH_EXCLUSION_LIST);
        setValues(settingsForm, 'searchExclusionList', list, { shouldTouched: false });
    })
    return (
        <>
            <Form onSubmit$={e => {
                setSetting(SEARCH_EXCLUSION_LIST, e.searchExclusionList)
            }} >
                <button class="btn btn-primary mt-3" disabled={!settingsForm.touched || settingsForm.invalid}>Lưu</button>
                <br />
                <label class="mt-3 form-label">Danh sách loại trừ:</label>
                <div>
                    <FieldArray name="searchExclusionList">
                        {
                            fieldArray => {
                                return <div>
                                    {
                                        fieldArray.items.map((item, index) => (
                                            <div key={item} class="mt-3">
                                                <Field name={`searchExclusionList.${index}`} validate={[
                                                    required('Vui lòng nhập')
                                                ]}>
                                                    {(field, props) => <div>
                                                        <div class="d-flex gap-3">
                                                            <input {...props} class={["form-control", { 'is-invalid': (settingsForm.submitted || field.touched) && field.error, 'is-valid': (settingsForm.submitted || field.touched) && !field.error }]} type="text" value={field.value} required />
                                                            <button type="button" class="btn btn-danger" onClick$={() => {
                                                                remove(settingsForm, 'searchExclusionList', { at: index })
                                                            }}>Xoá</button>
                                                        </div>
                                                        {field.error && <div class="invalid-feedback">{field.error}</div>}
                                                    </div>}
                                                </Field>
                                            </div>
                                        ))
                                    }
                                </div>
                            }
                        }
                    </FieldArray>
                    <button type="button" class="btn btn-info mt-3" onClick$={() => {
                        insert(settingsForm, 'searchExclusionList', {
                            value: '',
                        })
                    }}>Thêm mới</button>
                </div >
            </Form >
        </>
    );
});

export const head: DocumentHead = {
    title: 'Cài đặt'
};
