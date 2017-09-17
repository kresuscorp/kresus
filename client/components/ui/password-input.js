import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

class PasswordInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPassword: false
        };

        this.input = null;
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = typeof this.props.onChange === 'function' ?
                            this.handleChange.bind(this) :
                            null;
    }

    handleClick() {
        this.setState({
            showPassword: !this.state.showPassword
        });
    }

    focus() {
        this.input.focus();
    }

    clear() {
        this.input.value = '';
    }

    handleChange(event) {
        this.props.onChange((event.target.value || '').trim());
    }

    render() {
        let refInput = node => {
            this.input = node;
        };

        let iconClass;
        let type;
        let title;

        if (this.state.showPassword) {
            iconClass = 'eye-slash';
            type = 'text';
            title = $t('client.general.hide_password');
        } else {
            iconClass = 'eye';
            type = 'password';
            title = $t('client.general.show_password');
        }

        return (
            <div className="input-group">
                <input
                  type={ type }
                  className="form-control"
                  id={ this.props.id }
                  ref={ refInput }
                  placeholder={ this.props.placeholder }
                  onChange={ this.handleChange }
                  autoComplete="new-password"
                  defaultValue={ this.props.defaultValue }
                />
                <span
                  className={ `clickable input-group-addon fa fa-${iconClass}` }
                  onClick={ this.handleClick }
                  title={ title }
                />
            </div>
        );
    }
}

PasswordInput.propTypes = {
    // The id attribute used to match labels.
    id: PropTypes.string.isRequired,

    // The input's placeholder.
    placeholder: PropTypes.string,

    // A function called when the input changes.
    onChange: PropTypes.func,

    // The defaultValu of the input.
    defaultValue: PropTypes.string,
};

export default PasswordInput;
