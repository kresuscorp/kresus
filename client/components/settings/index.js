import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import { translate as $t } from '../../helpers';

import BankAccountsList from './bank-accesses';
import BackupParameters from './backup';
import EmailsParameters from './emails';
import WeboobParameters from './weboob';

import TabMenu from '../ui/tab-menu.js';

const SettingsComponents = props => {

    const pathPrefix = '/settings';

    let { currentAccountId, settingPanel } = props.match.params;
    if (typeof currentAccountId === 'undefined') {
        currentAccountId = settingPanel;
    }
    let menuItems = new Map();
    menuItems.set(`${pathPrefix}/accounts/${currentAccountId}`, $t('client.settings.tab_accounts'));
    menuItems.set(`${pathPrefix}/emails/${currentAccountId}`, $t('client.settings.tab_alerts'));
    menuItems.set(`${pathPrefix}/backup/${currentAccountId}`, $t('client.settings.tab_backup'));
    menuItems.set(`${pathPrefix}/weboob/${currentAccountId}`, $t('client.settings.tab_weboob'));

    const defaultRedirectComponent = () => {
        return (
            <Redirect
              to={ `${pathPrefix}/accounts/${currentAccountId}` }
              push={ false }
            />
        );
    };

    return (
        <div>
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">
                        { $t('client.settings.title') }
                    </h3>
                </div>

                <div className="panel-body">
                    <TabMenu
                      selected={ props.location.pathname }
                      tabs={ menuItems }
                      push={ props.push }
                      location={ props.location }
                    />
                    <Switch>
                        <Route
                          path={ `${pathPrefix}/accounts/${currentAccountId}` }
                          component={ BankAccountsList }
                        />
                        <Route
                          path={ `${pathPrefix}/backup/${currentAccountId}` }
                          component={ BackupParameters }
                        />
                        <Route
                          path={ `${pathPrefix}/weboob/${currentAccountId}` }
                          component={ WeboobParameters }
                        />
                        <Route
                          path={ `${pathPrefix}/emails/${currentAccountId}` }
                          component={ EmailsParameters }
                        />
                        <Route
                          render={ defaultRedirectComponent }
                        />
                    </Switch>
                </div>
            </div>
        </div>
    );
};

SettingsComponents.propTypes = {
    // Function to add an entry to the history. Automatically added by react-router;
    push: React.PropTypes.func.isRequired,

    // Location object (contains the current path). Automatically added by react-router.
    location: React.PropTypes.object.isRequired
};

export default SettingsComponents;
