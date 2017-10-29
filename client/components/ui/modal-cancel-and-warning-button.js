import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { actions } from '../../store';

const SaveAndWarning = connect(null, dispatch => {
    return {
        handleHide() {
            actions.hideModal(dispatch);
        }
    };
})(props => {
    return (
        <div>
            <input
                type="button"
                className="btn btn-default"
                onClick={props.handleHide}
                value={$t('client.general.cancel')}
            />
            <input
                type="submit"
                className="btn btn-warning"
                value={props.warningLabel}
                onClick={props.onClickWarning}
                disabled={props.isSaveDisabled}
            />
        </div>
    );
});

SaveAndWarning.propTypes = {
    // A function to be called when clicking on warning button.
    onClickWarning: PropTypes.func.isRequired,

    // An optional boolean telling whetehet the save button is disabled.
    isSaveDisabled: PropTypes.bool,

    // A label describing the action to be realized on clicking the warning button.
    warningLabel: PropTypes.string.isRequired
};

SaveAndWarning.defaultProps = {
    isSaveDisabled: false
};

export default SaveAndWarning;
