import { $, type QRL } from '@builder.io/qwik';
import { isSelectorValid } from '../util.service';
import type { MaybeValue } from '@modular-forms/qwik';

type Value = MaybeValue<string>;

export function cssSelectorValidate(
    error: string
): QRL<(value: Value) => string> {
    return $((value: Value) => value != null && (value == '' ||  isSelectorValid(value)) ? '' : error);
}
