import React from 'react';
import { NavLink, Link } from 'react-router-dom';

import { translate as $t } from '../../helpers';

import About from './about';
import BankList from './banks';
import LocaleSelector from './locale-selector';

const Menu = props => {
    let currentAccountId = typeof props.match.params.currentAccountId !== 'undefined' ?
                           props.match.params.currentAccountId : props.match.params.subsection;
    // Function to detect if the section is active
    const isActive = sectionPath => {
        return (match, location) => {
            return location.pathname.indexOf(sectionPath) === 0;
        };
    };
    return (
        <div
          id="kresus-menu"
          className="sidebar offcanvas-xs col-sm-3 col-xs-10">
            <div className="logo sidebar-light">
                <Link
                  to="/"
                  className="app-title">
                    { $t('client.KRESUS') }
                    <LocaleSelector />
                </Link>
            </div>

            <div className="banks-accounts-list">
                <BankList currentAccountId={ currentAccountId } />
            </div>

            <div className="sidebar-section-list">
                <ul>
                    <li>
                        <NavLink
                          to={ `/reports/${currentAccountId}` }
                          activeClassName={ 'active' }>
                            <i className="fa fa-briefcase" />
                            { $t('client.menu.reports') }
                        </NavLink>
                    </li>
                    <li >
                        <NavLink
                          to={ `/budget/${currentAccountId}` }
                          activeClassName={ 'active' }>
                            <i className="fa fa-heartbeat" />
                            { $t('client.menu.budget') }
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                          to={ `/charts/${currentAccountId}` }
                          activeClassName={ 'active' }
                          isActive={ isActive('/charts') }>
                            <i className="fa fa-line-chart" />
                            { $t('client.menu.charts') }
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                          to={ `/duplicates/${currentAccountId}` }
                          activeClassName={ 'active' }>
                            <i className="fa fa-clone" />
                            { $t('client.menu.similarities') }
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                          to={ `/categories/${currentAccountId}` }
                          activeClassName={ 'active' }>
                            <i className="fa fa-list-ul" />
                            { $t('client.menu.categories') }
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                          to={ `/settings/${currentAccountId}` }
                          activeClassName={ 'active' }
                          isActive={ isActive('/settings') }>
                            <i className="fa fa-cogs" />
                            { $t('client.menu.settings') }
                        </NavLink>
                    </li>
                    <li>
                        <a href="https://kresus.org/faq.html">
                            <i className="fa fa-question" />
                            { $t('client.menu.support') }
                        </a>
                    </li>
                </ul>
            </div>

            <div className="sidebar-about">
                <About />
            </div>
        </div>
    );
};

export default Menu;
