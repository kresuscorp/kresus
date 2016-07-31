import React from 'react';
import { connect } from 'react-redux';

import { has, translate as $t } from '../../helpers';
import { actions } from '../../store';

import { DetailedViewLabel } from './label';

import OperationTypeSelect from './operation-type-select';
import CategorySelect from './category-select';

export function computeAttachmentLink(op) {
    let file = op.binary.fileName || 'file';
    return `operations/${op.id}/${file}`;
}

export default class OperationDetails extends React.Component {
    constructor(props) {
        has(props, 'onToggleDetails');
        has(props, 'operation');
        has(props, 'rowClassName');
        super(props);
    }

    render() {
        let op = this.props.operation;

        let maybeAttachment = '';
        if (op.binary !== null) {
            let opLink = computeAttachmentLink(op);
            maybeAttachment = (
                <span>
                    <a href={ opLink } target="_blank">
                        <span className="glyphicon glyphicon-file"></span>
                        { $t('client.operations.attached_file') }
                    </a>
                </span>
            );
        } else if (op.attachments && op.attachments.url !== null) {
            maybeAttachment = (
                <span>
                    <a href={ op.attachments.url } target="_blank">
                        <span className="glyphicon glyphicon-file"></span>
                        { $t(`client.${op.attachments.linkTranslationKey}`) }
                    </a>
                </span>
            );
        }

        return (
            <tr className={ this.props.rowClassName }>
                <td>
                    <a href="#" onClick={ this.props.onToggleDetails }>
                        <i className="fa fa-minus-square"></i>
                    </a>
                </td>
                <td colSpan="5" className="text-uppercase">
                    <ul>
                        <li>
                            { $t('client.operations.full_label') }
                            { op.raw }
                        </li>
                        <li className="form-inline">
                            { $t('client.operations.custom_label') }
                            <DetailedViewLabel operation={ op } />
                        </li>
                        <li>
                            { $t('client.operations.amount') }
                            { op.amount }
                        </li>
                        <li className="form-inline">
                            { $t('client.operations.type') }
                            <OperationTypeSelect operation={ op } />
                        </li>
                        <li className="form-inline">
                            { $t('client.operations.category') }
                            <CategorySelect operation={ op } />
                        </li>
                        { maybeAttachment }
                    </ul>
                </td>
            </tr>
        );
    }
}

