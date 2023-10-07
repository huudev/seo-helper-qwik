import { component$, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getValues, required, setValue, useForm } from "@modular-forms/qwik";
import type { FetchAnchorForm, FetchAnchorResultInfo, Item } from "~/common/fetch-anchor/dto";
import { STATUS_FAIL, STATUS_PROCESSING, STATUS_SUCESS } from "~/common/fetch-anchor/dto";
import { fetchHtml } from "~/common/fetch-anchor/fetch-html";
import { FETCH_ANCHOR_CSS_SELECTOR, FETCH_ANCHOR_REGEX_FILTER, FETCH_ANCHOR_URL_FILTER, getSetting, setSetting } from "~/common/settings.service";
import { showSucessNoti } from "~/common/toast.service";
import { termToSentences } from "~/common/util.service";
import { cssSelectorValidate } from "~/common/validate/css-selector.validate";
import { regexValidate } from "~/common/validate/regex.validate";

export default component$(() => {
    const [fetchAnchorForm, { Form, Field }] = useForm({
        loader: useSignal<FetchAnchorForm>({ cssSelector: '', pageUrls: '', urlFilter: '', regexFilter: false }),
        validateOn: 'touched',
    });
    const state = useStore({ fetchAnchorResults: [] as FetchAnchorResultInfo[], fetching: false });
    useVisibleTask$(async () => {
        const cssSelector = await getSetting(FETCH_ANCHOR_CSS_SELECTOR);
        setValue(fetchAnchorForm, 'cssSelector', cssSelector, { shouldTouched: false });

        const urlFilter = await getSetting(FETCH_ANCHOR_URL_FILTER);
        setValue(fetchAnchorForm, 'urlFilter', urlFilter, { shouldTouched: false });

        const regexFilter = await getSetting(FETCH_ANCHOR_REGEX_FILTER);
        setValue(fetchAnchorForm, 'regexFilter', regexFilter, { shouldTouched: false });
    });
    return (
        <>
            <Form>
                <div class="mt-3">
                    <label for="cssSelector" class="form-label">Truy vấn css <span class="text-danger">*</span></label>
                    <Field
                        name="cssSelector"
                        validate={[required('Vui lòng nhập'), cssSelectorValidate('Cú pháp không hợp lệ')]}>
                        {(field, props) => (
                            <>
                                <textarea {...props} class={["form-control", { 'is-invalid': (fetchAnchorForm.submitted || field.touched) && field.error, 'is-valid': (fetchAnchorForm.submitted || field.touched) && !field.error }]} id="cssSelector" value={field.value} rows={2}></textarea>
                                {field.error && <div class="invalid-feedback">{field.error}</div>}
                            </>
                        )}
                    </Field>
                </div>
                <div class="mt-3">
                    <label for="urlFilter" class="form-label">Lọc liên kết</label>
                    <div class="input-group">
                        <Field
                            name="urlFilter"
                            validate={[regexValidate('Cú pháp không hợp lệ')]}>
                            {(field, props) => (
                                <>
                                    <input {...props} class={["form-control", { 'is-invalid': (fetchAnchorForm.submitted || field.touched) && field.error, 'is-valid': (fetchAnchorForm.submitted || field.touched) && !field.error }]} id="urlFilter" value={field.value} />
                                    <div class="input-group-text">
                                        <div class="form-check">
                                            <Field name="regexFilter" type="boolean">
                                                {(field, props) => <input {...props} class="form-check-input" type="checkbox" checked={field.value} id="regexFilter" />}
                                            </Field>
                                            <label class="form-check-label" for="regexFilter">Biểu thức</label>
                                        </div>
                                    </div>
                                    {field.error && <div class="invalid-feedback">{field.error}</div>}
                                </>
                            )}
                        </Field>
                    </div>

                </div>
                <div class="mt-3">
                    <label for="pageUrls" class="form-label">Danh sách liên kết của các trang <span class="text-danger">*</span></label>
                    <Field
                        name="pageUrls"
                        validate={[required('Vui lòng nhập')]}>
                        {(field, props) => (
                            <>
                                <textarea {...props} class={["form-control", { 'is-invalid': (fetchAnchorForm.submitted || field.touched) && field.error, 'is-valid': (fetchAnchorForm.submitted || field.touched) && !field.error }]} id="pageUrls" value={field.value} rows={8} required></textarea>
                                {field.error && <div class="invalid-feedback">{field.error}</div>}
                            </>
                        )}
                    </Field>
                </div>
                <div class="d-flex mt-3 gap-3">
                    <button class="btn btn-primary" onClick$={async () => {
                        if (fetchAnchorForm.invalid) {
                            return;
                        }
                        state.fetching = true;
                        state.fetchAnchorResults = [];
                        const { cssSelector, urlFilter, regexFilter, pageUrls } = getValues(fetchAnchorForm);
                        setSetting(FETCH_ANCHOR_CSS_SELECTOR, cssSelector);
                        setSetting(FETCH_ANCHOR_URL_FILTER, urlFilter);
                        setSetting(FETCH_ANCHOR_REGEX_FILTER, regexFilter);

                        const listPageUrl = termToSentences(pageUrls!);

                        let regex: RegExp = null as unknown as RegExp;
                        if (regexFilter && urlFilter != '') {
                            regex = new RegExp(urlFilter!, 'g');
                        }
                        await Promise.allSettled(listPageUrl.map((pageUrl, idx) => {
                            state.fetchAnchorResults.push({ pageUrl: pageUrl, items: [], status: STATUS_PROCESSING });
                            return fetchHtml(pageUrl)
                                .then(html => {
                                    const parser = new DOMParser();
                                    const doc = parser.parseFromString(html, "text/html");
                                    const elements = doc.querySelectorAll(cssSelector!);
                                    const items: Item[] = [];
                                    const urlParser = new URL(pageUrl);

                                    for (let i = 0; i < elements.length; ++i) {
                                        const element = elements[i];
                                        if (element instanceof HTMLAnchorElement) {
                                            if (element.host == document.location.host) {
                                                element.host = urlParser.host;
                                                element.protocol = urlParser.protocol;
                                            }
                                            const text = (element.textContent ?? '').trim().replace(/\n|\t/g, ' ');
                                            const url = element.href;
                                            if (text && url && !url.startsWith('javascript:void(')) {
                                                if (urlFilter) {
                                                    if (regexFilter) {
                                                        regex.lastIndex = 0;
                                                        if (regex.test(url)) {
                                                            items.push({ text, url })
                                                        }
                                                    } else {
                                                        if (url.includes(urlFilter)) {
                                                            items.push({ text, url })
                                                        }
                                                    }
                                                } else {
                                                    items.push({ text, url })
                                                }
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
                        showSucessNoti("Tìm kiếm xong");
                    }} disabled={!fetchAnchorForm.touched || fetchAnchorForm.invalid || state.fetching}>
                        {state.fetching && <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                        {" Lấy liên kết"}
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
                                showSucessNoti("Sao chép thành công");
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
                            <th scope="col">Liên kết trang</th>
                            <th scope="col">Trạng thái</th>
                            <th scope="col">Tổng liên kết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            state.fetchAnchorResults.map((result, idx) => <tr key={idx + result.pageUrl} class={{ 'table-danger': result.status == STATUS_FAIL }}>
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
