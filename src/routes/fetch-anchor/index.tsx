import { component$, useSignal, useStore } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import { getValues, required, useForm } from "@modular-forms/qwik";
import { showSucessNoti } from "~/common/toast.service";
import { termToSentences } from "~/common/util.service";
import { cssSelectorValidate } from "~/common/validate";

type FetchAnchorForm = {
    cssSelector: string;
    pageUrls: string;
};

type Item = {
    text: string;
    url: string;
}

type FetchAnchorResultInfo = {
    pageUrl: string;
    items: Item[];
    status: string;
}

const STATUS_PROCESSING = 'Đang xử lý'
const STATUS_SUCESS = 'Thành công'
const STATUS_FAIL = 'Thất bại'

export default component$(() => {
    const [fetchAnchorForm, { Form, Field }] = useForm<FetchAnchorForm>({
        loader: useSignal({ cssSelector: '', pageUrls: '' }),
        validateOn: 'touched',
    });
    const state = useStore({ fetchAnchorResults: [] as FetchAnchorResultInfo[], fetching: false })
    return (
        <>
            <Form>
                <Field
                    name="cssSelector"
                    validate={[required('Vui lòng nhập'), cssSelectorValidate('Cú pháp không hợp lệ')]}>
                    {(field, props) => (
                        <div class="mt-3">
                            <label for="cssSelector" class="form-label">Truy vấn css:</label>
                            <textarea {...props} class={["form-control", { 'is-invalid': (fetchAnchorForm.submitted || field.touched) && field.error, 'is-valid': (fetchAnchorForm.submitted || field.touched) && !field.error }]} id="cssSelector" value={field.value} rows={2}></textarea>
                            {field.error && <div class="invalid-feedback">{field.error}</div>}
                        </div>
                    )}
                </Field>
                <Field
                    name="pageUrls"
                    validate={[required('Vui lòng nhập')]}>
                    {(field, props) => (
                        <div class="mt-3">
                            <label for="pageUrls" class="form-label">Danh sách url của các trang:</label>
                            <textarea {...props} class={["form-control", { 'is-invalid': (fetchAnchorForm.submitted || field.touched) && field.error, 'is-valid': (fetchAnchorForm.submitted || field.touched) && !field.error }]} id="pageUrls" value={field.value} rows={8} required></textarea>
                            {field.error && <div class="invalid-feedback">{field.error}</div>}
                        </div>
                    )}
                </Field>
                <div class="d-flex mt-3 gap-3">
                    <button class="btn btn-primary" onClick$={async () => {
                        if (fetchAnchorForm.invalid) {
                            return;
                        }
                        state.fetching = true;
                        state.fetchAnchorResults = [];
                        const formValue = getValues(fetchAnchorForm);
                        const pageUrls = termToSentences(formValue.pageUrls!)
                        await Promise.allSettled(pageUrls.map((pageUrl, idx) => {
                            state.fetchAnchorResults.push({ pageUrl: pageUrl, items: [], status: STATUS_PROCESSING });
                            return fetch(pageUrl)
                                .then(res => res.text())
                                .then(html => {
                                    const parser = new DOMParser();
                                    const doc = parser.parseFromString(html, "text/html");
                                    const elements = doc.querySelectorAll(formValue.cssSelector!);
                                    const items: Item[] = [];
                                    const urlParser = new URL(pageUrl);
                                    for (let i = 0; i < elements.length; ++i) {
                                        const element = elements[i];
                                        if (element instanceof HTMLAnchorElement) {
                                            if (element.host == document.location.host) {
                                                element.host = urlParser.host;
                                                element.protocol = urlParser.protocol;
                                            }
                                            let text = (element.textContent ?? '').trim().replace(/\n|\t/g, ' ');
                                            let url = element.href;
                                            if (text && url && !url.startsWith('javascript:void(')) {
                                                items.push({ text, url })
                                            }
                                        }
                                    }
                                    const result = state.fetchAnchorResults[idx];
                                    result.items = items;
                                    result.status = STATUS_SUCESS
                                })
                                .catch(() => {
                                    const result = state.fetchAnchorResults[idx];
                                    result.status = STATUS_FAIL
                                })
                        }))
                        state.fetching = false;
                    }} disabled={!fetchAnchorForm.touched || fetchAnchorForm.invalid || state.fetching}>
                        {state.fetching && <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                        {" Lấy url"}
                    </button>
                    <button class="btn btn-success" disabled={!fetchAnchorForm.submitted || state.fetching}
                        onClick$={() => {
                            let textToCopy = ''
                            for (const result of state.fetchAnchorResults) {
                                if (result.status == STATUS_SUCESS) {
                                    for (const item of result.items) {
                                        textToCopy += result.pageUrl + '\t' + item.text + '\t' + item.url + '\n'
                                    }
                                }
                            }
                            navigator.clipboard.writeText(textToCopy).then(() => {
                                showSucessNoti("Sao chép thành công")
                            }).catch(e => {
                                console.log(e);
                            });
                        }}>
                        {state.fetching && <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                        {" Sao chép kết quả"}
                    </button>
                </div>
            </Form >
            <div class={['mt-3', { 'd-none': !fetchAnchorForm.submitted }]}>
                <table class="table table-sm table-bordered table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Url trang</th>
                            <th scope="col">Trạng thái</th>
                            <th scope="col">Tổng url</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            state.fetchAnchorResults.map((result, idx) => <tr class={{ 'table-danger': result.status == STATUS_FAIL }}>
                                <th scope="row">{idx + 1}</th>
                                <td>{result.pageUrl}</td>
                                <td>{result.status}</td>
                                <td>{result.items.length}</td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </>
    );
});

export const head: DocumentHead = {
    title: 'Lấy thông tin <a>'
};
