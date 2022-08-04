export interface FormDetails {
    id: string;
    name: string;
    type: 'form' | 'component' | string;
    state?: any;
}

export interface FormProps extends FormDetails {
    components?: FieldProps;
    version: number;
}

export interface DataValue {
    label: string;
    value: string;
}

interface DataWithShortcut extends DataValue {
    label: string;
    value: string;
    shortcut?: string;
}

export interface ValidationProps {
    customMessage?: string;
    pattern?: RegExp;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

export interface FieldProps {
    defaultValue?: string | boolean | unknown[];
    description?: string;
    disableOnInvalid?: boolean;
    disabled?: boolean;
    input?: boolean;
    key?: string;
    label?: string;
    multiple?: boolean;
    placeholder?: string;
    type?:
        | 'textfield'
        | 'checkbox'
        | 'selectboxes'
        | 'number'
        | 'email'
        | 'phoneNumber'
        | 'datetime'
        | 'textarea'
        | 'button'
        | 'select'
        | 'radio'
        | 'panel'
        | 'url'
        | 'currency'
        | 'password'
        | 'file';
    validate?: ValidationProps;
    validateOn?: 'change' | 'blur';

    data?: {
        values: DataValue[];
    };
    widget?: unknown;
    inputMask?: string;
    action?: 'next' | 'save' | 'callback' | 'triggerProcess';
    enableTime?: boolean;
    variableValue?: unknown;
    values?: DataWithShortcut[];
    components?: FieldProps[];
    mask?: boolean;
    currency?: string;
    spellcheck?: boolean;
    storage?: string;
    webcam?: boolean;
    fileTypes?: DataValue[];
}

export interface SingleFormProps {
    display?: string;
    components?: FieldProps | [];
    state?: {};
}

export interface SingleForm {
    id: string;
    name: string;
    version: number;
    type: 'form' | 'component' | string;
    isDefault: boolean;
    components: SingleFormProps | { state: {} };
    componentType?: string;
}

export interface FormioSchema {
    label?: string;
    tableView?: boolean;
    tooltip?: string;
    disabled?: boolean;
    key?: string;
    validate?: {
        required?: boolean;
        custom?: string;
        customPrivate?: false;
        strictDateValidation?: false;
        multiple?: false;
        unique?: false;
        pattern?: string;
        customMessage?: string;
        json?: string;
        minLength?: null;
        maxLength?: null;
    };
    type?: 'checkbox' | 'button' | 'number' | 'textarea' | 'textfield';
    input?: boolean;
    defaultValue?: string | null;
    size?: string;
    block?: boolean;
    action?: string;
    disableOnInvalid?: boolean;
    theme?: string;
    placeholder?: string;
    prefix?: string;
    customClass?: string;
    suffix?: string;
    multiple?: boolean;
    protected?: boolean;
    unique?: boolean;
    persistent?: boolean;
    hidden?: boolean;
    clearOnHide?: boolean;
    refreshOn?: string;
    redrawOn?: string;
    modalEdit?: boolean;
    labelPosition?: string;
    description?: string;
    errorLabel?: string;
    hideLabel?: boolean;
    tabindex?: string;
    autofocus?: boolean;
    dbIndex?: boolean;
    customDefaultValue?: string;
    calculateValue?: string;
    calculateServer?: boolean;
    widget?: {
        type?: string;
    };
    attributes?: { [key: string]: unknown };
    validateOn?: string;
    conditional?: {
        show?: null;
        when?: null;
        eq?: string;
    };
    overlay: {
        style?: string;
        left?: string;
        top?: string;
        width?: string;
        height?: string;
    };
    allowCalculateOverride?: boolean;
    encrypted?: boolean;
    showCharCount?: boolean;
    showWordCount?: boolean;
    properties?: { [key: string]: unknown };
    allowMultipleMasks?: boolean;
    leftIcon?: string;
    rightIcon?: string;
    dataGridLabel?: boolean;
    id?: string;
    mask?: boolean;
    spellcheck?: boolean;
    delimiter?: boolean;
    requireDecimal?: boolean;
    inputFormat?: string;
    autoExpand?: boolean;
    rows?: number;
    inputMask?: string;
    inputType: string;
}

export interface Checkbox {
    label?: string;
    tableView?: boolean;
    tooltip?: string;
    disabled?: boolean;
    key?: string;
    validate?: {
        required?: boolean;
    };
    type?: string;
    input?: boolean;
    defaultValue?: string;
}

export const getTextFieldSchema = (
    id: string,
    label: string,
    required: boolean,
    placeholder?: string,
    defaultValue?: string,
    tooltip?: string,
): FormioSchema => ({
    label: label,
    placeholder: placeholder,
    description: '',
    tooltip: tooltip,
    inputMask: '',
    disabled: false,
    validateOn: 'change',
    validate: {
        required: required,
        pattern: '',
        customMessage: '',
        custom: '',
        customPrivate: false,
        json: '',
        minLength: null,
        strictDateValidation: false,
        multiple: false,
        unique: false,
        maxLength: null,
    },
    type: 'textfield',
    input: true,
    key: id,
    prefix: '',
    customClass: '',
    suffix: '',
    multiple: false,
    defaultValue: defaultValue,
    protected: false,
    unique: false,
    persistent: true,
    hidden: false,
    clearOnHide: true,
    refreshOn: '',
    redrawOn: '',
    tableView: true,
    modalEdit: false,
    labelPosition: 'top',
    errorLabel: '',
    hideLabel: false,
    tabindex: '',
    autofocus: false,
    dbIndex: false,
    customDefaultValue: '',
    calculateValue: '',
    calculateServer: false,
    widget: {
        type: 'input',
    },
    attributes: {},
    conditional: {
        show: null,
        when: null,
        eq: '',
    },
    overlay: {
        style: '',
        left: '',
        top: '',
        width: '',
        height: '',
    },
    allowCalculateOverride: false,
    encrypted: false,
    showCharCount: false,
    showWordCount: false,
    properties: {},
    allowMultipleMasks: false,
    mask: false,
    inputType: 'text',
    inputFormat: 'plain',
    spellcheck: true,
    id: id,
});

export interface TextArea {
    label?: string;
    placeholder?: string;
    autoExpand?: boolean;
    tooltip?: string;
    disabled?: boolean;
    tableView?: boolean;
    hidden?: boolean;
    inputFormat?: string;
    validate?: {
        required: boolean;
        custom: string;
    };
    key?: string;
    type?: string;
    rows?: number;
    input?: boolean;
    defaultValue?: string | null;
    persistent?: boolean;
}

export const getTextAreaSchema = (
    id: string,
    label: string,
    required: boolean,
    placeholder?: string,
    defaultValue?: string | null,
    tooltip?: string,
    row = 6,
    disabled = false,
    hidden = false,
): TextArea => ({
    label: label,
    placeholder: placeholder,
    autoExpand: false,
    tooltip: tooltip,
    disabled: disabled,
    tableView: true,
    hidden: hidden,
    inputFormat: 'raw',
    validate: {
        required: required,
        custom: 'let json;\ntry {\n  json = JSON.parse(input);\n} catch (exception) {\n  json = null;\n}\n\n\nvalid = json ? true : "Please enter valid JSON Schema";\n',
    },
    key: id,
    type: 'textarea',
    rows: row,
    input: true,
    defaultValue: defaultValue,
    persistent: false,
});

export interface NumberField {
    label: string;
    placeholder?: string;
    mask: boolean;
    spellcheck: boolean;
    tableView: boolean;
    delimiter: boolean;
    requireDecimal: boolean;
    inputFormat: string;
    tooltip?: string;
    disabled: boolean;
    validate: {
        required: boolean;
    };
    key: string;
    type: string;
    input: boolean;
    defaultValue?: number;
}

export const getNumberSchema = (
    id: string,
    label: string,
    required: boolean,
    placeholder?: string,
    defaultValue?: number,
    tooltip?: string,
    disabled = false,
): NumberField => ({
    label: label,
    placeholder: placeholder,
    mask: false,
    spellcheck: true,
    tableView: false,
    delimiter: false,
    requireDecimal: false,
    inputFormat: 'plain',
    tooltip: tooltip,
    disabled: disabled,
    validate: {
        required: required,
    },
    key: id,
    type: 'number',
    input: true,
    defaultValue: defaultValue,
});

export const getCheckboxSchema = (
    id: string,
    label: string,
    required?: boolean,
    defaultValue?: string,
    tooltip?: string,
    disabled = false,
): Checkbox => ({
    label: label,
    tableView: false,
    tooltip: tooltip,
    disabled: disabled,
    key: id,
    validate: {
        required: required,
    },
    type: 'checkbox',
    input: true,
    defaultValue: defaultValue,
});

export interface SubmitScheme {
    type: string;
    label: string;
    key: string;
    size: string;
    block: boolean;
    action: string;
    disableOnInvalid: boolean;
    theme: string;
    input: boolean;
    placeholder: string;
    prefix: string;
    customClass: string;
    suffix: string;
    multiple: boolean;
    defaultValue: null;
    protected: boolean;
    unique: boolean;
    persistent: boolean;
    hidden: boolean;
    clearOnHide: boolean;
    refreshOn: string;
    redrawOn: string;
    tableView?: boolean;
    modalEdit: boolean;
    labelPosition: string;
    description: string;
    errorLabel: string;
    tooltip: string;
    hideLabel: boolean;
    tabindex: string;
    disabled: boolean;
    autofocus: boolean;
    dbIndex: boolean;
    customDefaultValue: string;
    calculateValue: string;
    calculateServer: boolean;
    widget: {
        type: string;
    };
    attributes: { [key: string]: unknown };
    validateOn: string;
    validate: {
        required: boolean;
        custom: string;
        customPrivate: boolean;
        strictDateValidation: boolean;
        multiple: boolean;
        unique: boolean;
    };
    conditional: {
        show: null;
        when: null;
        eq: string;
    };
    overlay: {
        style: string;
        left: string;
        top: string;
        width: string;
        height: string;
    };
    allowCalculateOverride: boolean;
    encrypted: boolean;
    showCharCount: boolean;
    showWordCount: boolean;
    properties: { [key: string]: unknown };
    allowMultipleMasks: boolean;
    leftIcon: string;
    rightIcon: string;
    dataGridLabel: boolean;
    id: string;
}

export const submitButtonSchema = (label = 'Save'): SubmitScheme => ({
    type: 'button',
    label: label,
    key: 'submit',
    size: 'md',
    block: false,
    action: 'submit',
    disableOnInvalid: true,
    theme: 'primary',
    input: true,
    placeholder: '',
    prefix: '',
    customClass: '',
    suffix: '',
    multiple: false,
    defaultValue: null,
    protected: false,
    unique: false,
    persistent: false,
    hidden: false,
    clearOnHide: true,
    refreshOn: '',
    redrawOn: '',
    tableView: false,
    modalEdit: false,
    labelPosition: 'top',
    description: '',
    errorLabel: '',
    tooltip: '',
    hideLabel: false,
    tabindex: '',
    disabled: false,
    autofocus: false,
    dbIndex: false,
    customDefaultValue: '',
    calculateValue: '',
    calculateServer: false,
    widget: {
        type: 'input',
    },
    attributes: {},
    validateOn: 'change',
    validate: {
        required: false,
        custom: '',
        customPrivate: false,
        strictDateValidation: false,
        multiple: false,
        unique: false,
    },
    conditional: {
        show: null,
        when: null,
        eq: '',
    },
    overlay: {
        style: '',
        left: '',
        top: '',
        width: '',
        height: '',
    },
    allowCalculateOverride: false,
    encrypted: false,
    showCharCount: false,
    showWordCount: false,
    properties: {},
    allowMultipleMasks: false,
    leftIcon: '',
    rightIcon: '',
    dataGridLabel: true,
    id: 'emtgi44',
});
