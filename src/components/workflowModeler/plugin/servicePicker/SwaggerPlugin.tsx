import React, { ComponentClass } from 'react';
import { OpenAPIObject } from 'openapi3-ts';
import ActionButton from 'components/common/actionButton';

export const PickServicePlugin = (
    service: OpenAPIObject,
    onSelect: (service: OpenAPIObject, operationId: string, method: string, path: string) => void,
): { wrapComponents: { OperationSummary: (Original: ComponentClass) => React.FC } } => ({
    wrapComponents: {
        // eslint-disable-next-line
        OperationSummary:
            (Original: ComponentClass): React.FC =>
            // eslint-disable-next-line
            (props: any): React.ReactElement => {
                const operationProps = props.operationProps.toJSON();
                const operationId = operationProps.operationId;
                const method = operationProps.method;
                const path = operationProps.path;

                return (
                    <div style={{ display: 'flex', flexDirection: 'row', position: 'relative', width: '100%' }}>
                        <Original {...props} />
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                position: 'absolute',
                                height: '100%',
                                right: '0.5em',
                            }}>
                            <img
                                id={'picked_image_' + operationId}
                                alt="Check Icon"
                                src={require('../../../../assets/images/png/check.png')}
                                style={{
                                    float: 'right',
                                    width: '1.2em',
                                    marginRight: '0.5em',
                                    display: 'none',
                                }}
                            />
                            <ActionButton
                                variant="secondary"
                                buttonProps={{
                                    id: 'pick_button_' + operationId,
                                    style: { float: 'right', width: '10em' },
                                }}
                                onClick={(): void => onSelect(service, operationId, method, path)}>
                                Pick Service
                            </ActionButton>
                        </div>
                    </div>
                );
            },
    },
});
