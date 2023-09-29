import { $, type QRL } from '@builder.io/qwik';
import type { MaybeValue } from '@modular-forms/qwik';

type Value = MaybeValue<string>;

export function regexValidate(
    error: string
): QRL<(value: Value) => string> {
    return $((value: Value) => {
        if (value != null) {
            try {
                new RegExp(value);
                return '';
            } catch (e) {
                return error;
            }
        }
        return error;
    });
}
