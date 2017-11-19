import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { assert, assertHas, translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

import DeleteAlertButton from './confirm-delete-alert';

class ReportItem extends React.Component {
    handleOnSelectChange = event => {
        let newValue = event.target.value;
        if (newValue === this.props.alert.order) {
            return;
        }
        this.props.update({ frequency: newValue });
    };

    render() {
        let { account, alert, access } = this.props;

        assertHas(alert, 'frequency');
        assert(alert.type === 'report');

        return (
            <tr>
                <td className="col-md-3">{`${access.name} − ${account.title}`}</td>
                <td className="col-md-3">
                    <span className="condition">{$t('client.settings.emails.send_report')}</span>
                </td>
                <td className="col-md-5 frequency">
                    <select
                        className="form-control pull-right"
                        defaultValue={alert.frequency}
                        onChange={this.handleOnSelectChange}>
                        <option value="daily">{$t('client.settings.emails.daily')}</option>
                        <option value="weekly">{$t('client.settings.emails.weekly')}</option>
                        <option value="monthly">{$t('client.settings.emails.monthly')}</option>
                    </select>
                </td>
                <td className="col-md-1">
                    <DeleteAlertButton alertId={alert.id} type="report" />
                </td>
            </tr>
        );
    }
}

ReportItem.propTypes = {
    // The alert
    alert: PropTypes.object.isRequired,

    // The account for which the alert is configured
    account: PropTypes.object.isRequired,

    // The alert update function
    update: PropTypes.func.isRequired
};

export default connect(
    (state, ownProps) => {
        let access = get.accessById(state, ownProps.account.bankAccess);
        return { access };
    },
    (dispatch, props) => {
        return {
            update(newFields) {
                actions.updateAlert(dispatch, props.alert.id, newFields);
            }
        };
    }
)(ReportItem);
