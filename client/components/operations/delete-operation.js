import React from 'react';
import { connect } from 'react-redux';

import { assertHas, translate as $t } from '../../helpers';
import { actions } from '../../store';

import ConfirmDeleteModal from '../ui/confirm-delete-modal';

class DeleteOperation extends React.Component {
    constructor(props) {
        assertHas(props, 'operation');
        assertHas(props, 'formatCurrency');
        super(props);
    }

    render() {
        let op = this.props.operation;

        let label = `"${op.customLabel ? op.customLabel : op.title}"`;

        let amount = this.props.formatCurrency(op.amount);
        let date = op.date.toLocaleDateString();
        let modalBody = (
            <div>
                <div>{ $t('client.operations.warning_delete') }</div>
                <div>{ $t('client.operations.are_you_sure', { label, amount, date }) }</div>
            </div>
        );

        return (
            <div title={ this.props.disabled ? $t('client.operations.delete_title_disabled') : '' }>
                <button className="btn btn-danger"
                  data-toggle="modal"
                  data-target={ `#delete${op.id}` }
                  disabled={ this.props.disabled }>
                    <span className="fa fa-trash"></span>&nbsp;
                    { $t('client.operations.delete_operation_button') }
                </button>
                <ConfirmDeleteModal
                  modalId={ `delete${op.id}` }
                  modalBody={ modalBody }
                  onDelete={ this.props.handleDeleteOperation }
                />
            </div>
        );
    }
}

DeleteOperation.propTypes = {

    // Operation
    operation: React.PropTypes.object.isRequired,
    
    // Function to format operation amout
    formatCurrency: React.PropTypes.func.isRequired,

    // Disable status of the button
    disabled: React.PropTypes.bool.isRequired
}

export default connect(() => {
    return {};
}, (dispatch, props) => {
    return {
        handleDeleteOperation: () => actions.deleteOperation(dispatch, props.operation.id)
    };
})(DeleteOperation);
