import u from 'updeep';

import { assert,
         assertHas,
         debug,
         localeComparator,
         maybeHas,
         NONE_CATEGORY_ID,
         translate as $t } from '../helpers';

import { Account, Alert, Bank, Operation } from '../models';

import Errors, { genericErrorHandler } from '../errors';

import * as backend from './backend';

import { createReducerFromMap,
         fillOutcomeHandlers,
         updateMapIf,
         SUCCESS, FAIL } from './helpers';

import {
    CREATE_ACCESS,
    CREATE_ALERT,
    CREATE_OPERATION,
    DELETE_ACCESS,
    DELETE_ACCOUNT,
    DELETE_ALERT,
    DELETE_OPERATION,
    MERGE_OPERATIONS,
    SET_OPERATION_CATEGORY,
    SET_OPERATION_CUSTOM_LABEL,
    SET_OPERATION_TYPE,
    RUN_ACCOUNTS_SYNC,
    RUN_BALANCE_RESYNC,
    RUN_OPERATIONS_SYNC,
    UPDATE_ALERT
} from './actions';

import StaticBanks from '../../shared/banks.json';

// Basic actions creators
const basic = {

    setOperationCategory(operationId, categoryId, formerCategoryId) {
        return {
            type: SET_OPERATION_CATEGORY,
            operationId,
            categoryId,
            formerCategoryId
        };
    },

    setOperationType(operationId, type, formerType) {
        return {
            type: SET_OPERATION_TYPE,
            operationId,
            operationType: type,
            formerType
        };
    },

    setCustomLabel(operationId, formerCustomLabel, customLabel) {
        return {
            type: SET_OPERATION_CUSTOM_LABEL,
            operationId,
            customLabel,
            formerCustomLabel
        };
    },

    runOperationsSync(accessId, results = {}) {
        return {
            type: RUN_OPERATIONS_SYNC,
            accessId,
            results
        };
    },

    runAccountsSync(accessId, results = {}) {
        return {
            type: RUN_ACCOUNTS_SYNC,
            accessId,
            results
        };
    },

    createOperation(operation) {
        return {
            type: CREATE_OPERATION,
            operation
        };
    },

    deleteOperation(operationId) {
        return {
            type: DELETE_OPERATION,
            operationId
        };
    },

    mergeOperations(toKeep, toRemove) {
        return {
            type: MERGE_OPERATIONS,
            toKeep,
            toRemove
        };
    },

    createAccess(uuid, login, password, fields, access = {}, results = {}) {
        return {
            type: CREATE_ACCESS,
            uuid,
            login,
            password,
            fields,
            access,
            results
        };
    },

    deleteAccess(accessId, accountsIds) {
        return {
            type: DELETE_ACCESS,
            accessId,
            accountsIds
        };
    },

    resyncBalance(accountId, initialAmount) {
        return {
            type: RUN_BALANCE_RESYNC,
            accountId,
            initialAmount
        };
    },

    deleteAccount(accountId) {
        return {
            type: DELETE_ACCOUNT,
            accountId
        };
    },

    createAlert(alert) {
        return {
            type: CREATE_ALERT,
            alert
        };
    },

    updateAlert(alertId, attributes) {
        return {
            type: UPDATE_ALERT,
            alertId,
            attributes
        };
    },

    deleteAlert(alertId) {
        return {
            type: DELETE_ALERT,
            alertId
        };
    }
};

const fail = {}, success = {};
fillOutcomeHandlers(basic, fail, success);

export function setOperationType(operationId, type, formerType) {
    assert(typeof operationId === 'string', 'SetOperationType first arg must be an id');
    assert(typeof type === 'string', 'SetOperationType second arg must be a String id');
    assert(typeof formerType === 'string', 'SetOperationType 3rd arg must be a String id');

    return dispatch => {
        dispatch(basic.setOperationType(operationId, type, formerType));
        backend.setTypeForOperation(operationId, type)
        .then(() => {
            dispatch(success.setOperationType(operationId, type, formerType));
        }).catch(err => {
            dispatch(fail.setOperationType(err, operationId, type, formerType));
        });
    };
}

export function setOperationCategory(operationId, categoryId, formerCategoryId) {
    assert(typeof operationId === 'string', 'SetOperationCategory first arg must have an id');
    assert(typeof categoryId === 'string', 'SetOperationCategory 2nd arg must be String id');
    assert(typeof formerCategoryId === 'string', 'SetOperationCategory 3nd arg must be String id');

    // The server expects an empty string for replacing by none
    let serverCategoryId = categoryId === NONE_CATEGORY_ID ? '' : categoryId;

    return dispatch => {
        dispatch(basic.setOperationCategory(operationId, categoryId, formerCategoryId));
        backend.setCategoryForOperation(operationId, serverCategoryId)
        .then(() => {
            dispatch(success.setOperationCategory(operationId, categoryId, formerCategoryId));
        }).catch(err => {
            dispatch(fail.setOperationCategory(err, operationId, categoryId, formerCategoryId));
        });
    };
}

export function setOperationCustomLabel(operationId, customLabel, formerCustomLabel) {
    assert(typeof operationId === 'string', 'setCustomLabel first arg must be a String id');
    assert(formerCustomLabel === null || typeof formerCustomLabel === 'string',
           'setCustomLabel 2nd arg must be a String or null');
    assert(typeof customLabel === 'string', 'setCustomLabel 3rd arg must be a String ');

    // The server expects an empty string for deleting the custom label.
    let serverCustomLabel = !customLabel ? '' : customLabel;

    return dispatch => {
        dispatch(basic.setCustomLabel(operationId, formerCustomLabel, customLabel));
        backend.setCustomLabel(operationId, formerCustomLabel, serverCustomLabel)
        .then(() => {
            dispatch(success.setCustomLabel(operationId, formerCustomLabel, customLabel));
        }).catch(err => {
            dispatch(fail.setCustomLabel(err, operationId, formerCustomLabel, customLabel));
        });
    };
}

export function mergeOperations(toKeep, toRemove) {
    assertHas(toKeep, 'id');
    assertHas(toRemove, 'id');

    return dispatch => {
        dispatch(basic.mergeOperations(toKeep, toRemove));
        backend.mergeOperations(toKeep.id, toRemove.id)
        .then(newToKeep => {
            dispatch(success.mergeOperations(newToKeep, toRemove));
        }).catch(err => {
            dispatch(fail.mergeOperations(err, toKeep, toRemove));
        });
    };
}

export function createOperation(operation) {
    return dispatch => {
        dispatch(basic.createOperation(operation));
        backend.createOperation(operation)
        .then(created => {
            dispatch(success.createOperation(created));
        }).catch(err => {
            dispatch(fail.createOperation(err, operation));
        });
    };
}

export function deleteOperation(operationId) {
    return dispatch => {
        dispatch(basic.deleteOperation(operationId));
        backend.deleteOperation(operationId)
        .then(() => {
            dispatch(success.deleteOperation(operationId));
        }).catch(err => {
            dispatch(fail.deleteOperation(err, operationId));
        });
    };
}

export function deleteAccess(accessId, get) {
    assert(typeof accessId === 'string', 'deleteAccess expects a string id');
    return (dispatch, getState) => {
        let accountsIds = get.accountsByAccessId(getState(), accessId).map(acc => acc.id);
        dispatch(basic.deleteAccess(accessId));
        backend.deleteAccess(accessId)
        .then(() => {
            dispatch(success.deleteAccess(accessId, accountsIds));
        }).catch(err => {
            dispatch(fail.deleteAccess(err, accessId));
        });
    };
}

export function deleteAccount(accountId) {
    assert(typeof accountId === 'string', 'deleteAccount expects a string id');

    return dispatch => {
        dispatch(basic.deleteAccount(accountId));
        backend.deleteAccount(accountId)
        .then(() => {
            dispatch(success.deleteAccount(accountId));
        }).catch(err => {
            dispatch(fail.deleteAccount(err, accountId));
        });
    };
}

export function resyncBalance(accountId) {
    assert(typeof accountId === 'string', 'resyncBalance expects a string id');

    return dispatch => {
        dispatch(basic.resyncBalance(accountId));
        backend.resyncBalance(accountId)
        .then(initialAmount => {
            dispatch(success.resyncBalance(accountId, initialAmount));
        }).catch(err => {
            dispatch(fail.resyncBalance(err, accountId));
        });
    };
}

export function runOperationsSync(accessId) {
    return dispatch => {
        dispatch(basic.runOperationsSync());
        backend.getNewOperations(accessId).then(results => {
            dispatch(success.runOperationsSync(accessId, results));
        })
        .catch(err => {
            dispatch(fail.runOperationsSync(err));
        });
    };
}

export function runAccountsSync(accessId) {
    return dispatch => {
        dispatch(basic.runAccountsSync(accessId));
        backend.getNewAccounts(accessId).then(results => {
            dispatch(success.runAccountsSync(accessId, results));
        })
        .catch(err => {
            dispatch(fail.runAccountsSync(err));
        });
    };
}

// Handle sync errors on the first synchronization, when a new access is
// created.
function handleFirstSyncError(err) {
    switch (err.code) {
        case Errors.EXPIRED_PASSWORD:
            alert($t('client.sync.expired_password'));
            break;
        case Errors.INVALID_PARAMETERS:
            alert($t('client.sync.invalid_parameters', { content: err.content || '?' }));
            break;
        case Errors.INVALID_PASSWORD:
            alert($t('client.sync.first_time_wrong_password'));
            break;
        case Errors.NO_ACCOUNTS:
            alert($t('client.sync.no_accounts'));
            break;
        case Errors.UNKNOWN_MODULE:
            alert($t('client.sync.unknown_module'));
            break;
        default:
            genericErrorHandler(err);
            break;
    }
}

function createAccessFromBankUUID(allBanks, uuid) {
    let bank = allBanks.filter(b => b.uuid === uuid);

    let name = '?';
    let customFields = {};
    if (bank.length) {
        let b = bank[0];
        name = b.name;
        customFields = b.customFields;
    }

    return {
        uuid,
        name,
        customFields
    };
}

export function createAccess(get, uuid, login, password, fields) {
    return (dispatch, getState) => {

        let allBanks = get.banks(getState());
        let access = createAccessFromBankUUID(allBanks, uuid);

        dispatch(basic.createAccess(uuid, login, password, fields));
        backend.createAccess(uuid, login, password, fields)
        .then(results => {
            dispatch(success.createAccess(uuid, login, password, fields, access, results));
        })
        .catch(err => {
            dispatch(fail.createAccess(err, uuid, login, password, fields));
        });
    };
}

export function createAlert(newAlert) {
    return dispatch => {
        dispatch(basic.createAlert(newAlert));
        backend.createAlert(newAlert)
        .then(created => {
            dispatch(success.createAlert(created));
        })
        .catch(err => {
            dispatch(fail.createAlert(err, newAlert));
        });
    };
}

export function updateAlert(alertId, attributes) {
    return dispatch => {
        dispatch(basic.updateAlert(alertId, attributes));
        backend.updateAlert(alertId, attributes)
        .then(() => {
            dispatch(success.updateAlert(alertId, attributes));
        })
        .catch(err => {
            dispatch(fail.updateAlert(err, alertId, attributes));
        });
    };
}

export function deleteAlert(alertId) {
    return dispatch => {
        dispatch(basic.deleteAlert(alertId));
        backend.deleteAlert(alertId)
        .then(() => {
            dispatch(success.deleteAlert(alertId));
        })
        .catch(err => {
            dispatch(fail.deleteAlert(err, alertId));
        });
    };
}

// Reducers
function reduceSetOperationCategory(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug("Operation's category successfully set");
        return state;
    }

    // Optimistic update.
    let categoryId;

    if (status === FAIL) {
        debug('Error when setting category for an operation', action.error);
        categoryId = action.formerCategoryId;
    } else {
        debug('Starting setting category for an operation...');
        categoryId = action.categoryId;
    }

    return u.updateIn(`operations.map.${action.operationId}`, { categoryId }, state);
}

function reduceSetOperationType(state, action) {
    let { status, operationId } = action;
    if (status === SUCCESS) {
        debug("Operation's type successfully set");
        return state;
    }

    // Optimistic update.
    let type;

    if (status === FAIL) {
        debug('Error when setting type for an operation', action.error);
        type = action.formerType;
    } else {
        debug('Starting setting type for an operation...');
        type = action.operationType;
    }

    return u.updateIn(`operations.map.${operationId}`, { type }, state);
}

function reduceSetOperationCustomLabel(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug("Operation's custom label successfully set");
        return state;
    }

    // Optimistic update.
    let customLabel;

    if (status === FAIL) {
        debug('Error when setting custom label for an operation', action.error);
        customLabel = action.formerCustomLabel;
    } else {
        debug('Starting setting custom label for an operation...');
        customLabel = action.customLabel;
    }

    return u.updateIn(`operations.map.${action.operationId}`, { customLabel }, state);
}

// Handle any synchronization error, after the first one.
function handleSyncError(err) {
    switch (err.code) {
        case Errors.EXPIRED_PASSWORD:
            alert($t('client.sync.expired_password'));
            break;
        case Errors.INVALID_PASSWORD:
            alert($t('client.sync.wrong_password'));
            break;
        case Errors.NO_ACCOUNTS:
            alert($t('client.sync.no_accounts'));
            break;
        case Errors.NO_PASSWORD:
            alert($t('client.sync.no_password'));
            break;
        case Errors.UNKNOWN_MODULE:
            alert($t('client.sync.unknown_module'));
            break;
        default:
            genericErrorHandler(err);
            break;
    }
}

function finishSync(state, results) {
    let newState = state;
    let { accounts, newOperations } = results;

    assert(maybeHas(results, 'accounts') || maybeHas(results, 'operations'),
           'should have something to update');

    if (typeof accounts !== 'undefined') {
        assertHas(results, 'accessId');
        let accessId = results.accessId;

        accounts = accounts.map(a => new Account(a, state.constants.defaultCurrency));

        // Remove former accounts and reinsert them.
        let unrelated = state.accounts.filter(a => a.bankAccess !== accessId);
        accounts = unrelated.concat(accounts);

        sortAccounts(accounts);

        newState = u.updateIn('accounts', () => accounts, newState);

        // Load a pair of current access/account, after the initial creation load.
        if (newState.currentAccountId === null) {
            newState = u({
                currentAccessId: accessId,
                currentAccountId: accounts[0].id
            }, newState);
        }
    }

    if (typeof newOperations !== 'undefined') {
        // Add new operations.
        let operations = newOperations.map(o => new Operation(o));
        operations = state.operations.concat(operations);

        sortOperations(operations);

        newState = u.updateIn('operations', () => operations, newState);
    }

    return u({
        processingReason: null
    }, newState);
}

function reduceRunOperationsSync(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Sync successfully terminated.');
        let { results, accessId } = action;
        results.accessId = accessId;
        return finishSync(state, results);
    }

    if (status === FAIL) {
        debug('Sync error!');
        handleSyncError(action.error);
        return u({ processingReason: null }, state);
    }

    debug('Starting sync...');
    return u({ processingReason: 'client.spinner.sync' }, state);
}

function reduceRunAccountsSync(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Account sync successfully terminated.');

        let { results } = action;
        results.accessId = action.accessId;

        return finishSync(state, results);
    }

    if (status === FAIL) {
        debug('Account sync error:', action.error);
        handleSyncError(action.error);
        return u({ processingReason: null }, state);
    }

    debug('Starting accounts sync...');
    return u({ processingReason: 'client.spinner.sync' }, state);
}

function reduceMergeOperations(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        // Remove the former operation:
        let ret = u.updateIn('operations', u.reject(o => o.id === action.toRemove.id), state);

        // Replace the kept one:
        let newKept = new Operation(action.toKeep);
        return u.updateIn('operations',
                          updateMapIf('id', action.toKeep.id, newKept),
                          ret);
    }

    if (status === FAIL) {
        debug('Failure when merging operations:', action.error);
        return state;
    }

    debug('Merging operations...');
    return state;
}

function reduceCreateOperation(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Successfully created operation.');

        let { operation } = action;

        let operations = state.operations;
        let newOp = [new Operation(operation)];
        operations = newOp.concat(operations);

        sortOperations(operations);

        return u({ operations }, state);
    }

    if (status === FAIL) {
        debug('Failure when creating an operation:', action.error);
        return state;
    }

    debug('Creating operation...');
    return state;
}

function reduceDeleteOperation(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { operationId } = action;
        debug('Successfully deleted operation', operationId);
        return u({
            operations: {
                ids: u.reject(id => id === operationId),
                map: u.omit(`${operationId}`)
            }
        }, state);
    }

    if (status === FAIL) {
        debug('Error when deleting operation:', action.error);
        return state;
    }

    debug('Starting operation deletion...');
    return state;
}

function reduceResyncBalance(state, action) {
    let { status, accountId } = action;
    if (status === SUCCESS) {
        debug('Successfully resynced balance.');
        let { initialAmount } = action;
        let s = u.updateIn('accounts', updateMapIf('id', accountId, u({ initialAmount })), state);
        return u({ processingReason: null }, s);
    }

    if (status === FAIL) {
        debug('Failure when syncing balance:', action.error);
        return u({ processingReason: null }, state);
    }

    debug('Starting account balance resync...');
    return u({ processingReason: 'client.spinner.balance_resync' }, state);
}

function reduceDeleteAccountInternal(state, accountId) {
    let { accountNumber, bankAccess } = accountById(state, accountId);

    // Remove account:
    let ret = u.updateIn('accounts', u.reject(a => a.id === accountId), state);

    // Remove operations:
    ret = u.updateIn('operations', u.reject(o => o.bankAccount === accountNumber), ret);

    // Remove alerts:
    ret = u.updateIn('alerts', u.reject(a => a.bankAccount === accountNumber), ret);

    // If this was the last account of the access, remove the access too:
    if (accountsByAccessId(state, bankAccess).length === 1) {
        ret = u.updateIn('accesses', u.reject(a => a.id === bankAccess), ret);
    }

    return ret;
}

function reduceDeleteAccount(state, action) {
    let { accountId, status } = action;

    if (status === SUCCESS) {
        debug('Successfully deleted account.');

        let ret = reduceDeleteAccountInternal(state, accountId);

        // Maybe the current access has been destroyed (if the account was the
        // last one) and we need to find a new one.
        let formerAccessId = accountById(state, accountId).bankAccess;
        let formerAccessStillExists = !!ret.accesses.filter(a => a.id === formerAccessId).length;

        let currentAccessId = null;
        let currentAccountId = null;
        if (formerAccessStillExists) {
            currentAccessId = formerAccessId;
            currentAccountId = ret.accounts.filter(a => a.bankAccess === currentAccessId)[0].id;
        } else {
            // Either there is another access and we take it and its first
            // account; or there is nothing, and the user must create a new
            // access.
            let otherAccess = ret.accesses.length ? ret.accesses[0] : null;
            if (otherAccess) {
                currentAccessId = otherAccess.id;
                currentAccountId = ret.accounts.filter(a => a.bankAccess === currentAccessId)[0].id;
            }
            // otherwise let them be null.
        }

        ret = u({
            currentAccessId,
            currentAccountId
        }, ret);

        return u({ processingReason: null }, ret);
    }

    if (status === FAIL) {
        debug('Failure when deleting account:', action.error);
        return u({ processingReason: null }, state);
    }

    debug('Deleting account...');
    return u({ processingReason: 'client.spinner.delete_account' }, state);
}

function reduceDeleteAccess(state, action) {
    let { accessId, status } = action;

    if (status === SUCCESS) {
        debug('Successfully deleted access.');

        // Remove associated accounts.
        let ret = state;
        for (let account of accountsByAccessId(state, accessId)) {
            ret = reduceDeleteAccountInternal(ret, account.id);
        }

        // Update current access and account, if necessary.
        if (getCurrentAccessId(state) === accessId) {

            let currentAccessId = ret.accesses.length ? ret.accesses[0].id : null;

            let otherAccounts = ret.accounts.filter(a => a.bankAccess === currentAccessId);
            let currentAccountId = otherAccounts.length ? otherAccounts[0].id : null;

            ret = u({
                currentAccessId,
                currentAccountId
            }, ret);
        }

        return u({ processingReason: null }, ret);
    }

    if (status === FAIL) {
        debug('Failure when deleting access:', action.error);
        return u({ processingReason: null }, state);
    }

    debug('Deleting access...');
    return u({ processingReason: 'client.spinner.delete_account' }, state);
}

function reduceCreateAccess(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Successfully created access.');

        let { access } = action;
        access.id = action.results.accessId;

        let newState = u({
            accesses: state.accesses.concat(access)
        }, state);

        return finishSync(newState, action.results);
    }

    if (status === FAIL) {
        debug('Failure when creating access:', action.error);
        handleFirstSyncError(action.error);
        return u({ processingReason: null }, state);
    }

    debug('Creating access...');
    return u({ processingReason: 'client.spinner.fetch_account' }, state);
}

function reduceUpdateAccess(state, action) {
    if (action.status !== SUCCESS) {
        return state;
    }

    assertHas(action, 'results');
    return finishSync(state, action.results);
}

function reduceCreateAlert(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Alert successfully created');
        let a = new Alert(action.alert);
        return u({
            alerts: [a].concat(state.alerts)
        }, state);
    }

    if (status === FAIL) {
        debug('Error when creating alert', action.error);
        return state;
    }

    debug('Starting alert creation...');
    return state;
}

function reduceUpdateAlert(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Alert successfully updated');
        let { attributes, alertId } = action;
        return u.updateIn('alerts', updateMapIf('id', alertId, u(attributes)), state);
    }

    if (status === FAIL) {
        debug('Error when updating alert', action.error);
        return state;
    }

    debug('Starting alert update...');
    return state;
}

function reduceDeleteAlert(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { alertId } = action;
        debug('Successfully deleted alert', alertId);
        return u({
            alerts: u.reject(a => a.id === alertId)
        }, state);
    }

    if (status === FAIL) {
        debug('Error when deleting alert:', action.error);
        return state;
    }

    debug('Starting alert deletion...');
    return state;
}

// Reducers on external actions.
function reduceDeleteCategory(state, action) {
    if (action.status !== SUCCESS)
        return state;

    let { id, replaceByCategoryId } = action;

    return u.updateIn('operations',
                      updateMapIf('categoryId', id, { categoryId: replaceByCategoryId }),
                      state);
}

// Initial state.
const bankState = u({
    // A list of the banks.
    banks: [],
    accesses: [],
    accounts: [],
    operations: {
        ids: [],
        map: {}
    },
    alerts: [],
    currentAccessId: null,
    currentAccountId: null
}, {});

// Mapping of actions => reducers.
const reducers = {
    CREATE_OPERATION: reduceCreateOperation,
    CREATE_ACCESS: reduceCreateAccess,
    CREATE_ALERT: reduceCreateAlert,
    DELETE_ACCESS: reduceDeleteAccess,
    DELETE_ACCOUNT: reduceDeleteAccount,
    DELETE_ALERT: reduceDeleteAlert,
    DELETE_CATEGORY: reduceDeleteCategory,
    DELETE_OPERATION: reduceDeleteOperation,
    MERGE_OPERATIONS: reduceMergeOperations,
    RUN_ACCOUNTS_SYNC: reduceRunAccountsSync,
    RUN_BALANCE_RESYNC: reduceResyncBalance,
    RUN_OPERATIONS_SYNC: reduceRunOperationsSync,
    SET_OPERATION_CATEGORY: reduceSetOperationCategory,
    SET_OPERATION_CUSTOM_LABEL: reduceSetOperationCustomLabel,
    SET_OPERATION_TYPE: reduceSetOperationType,
    UPDATE_ALERT: reduceUpdateAlert,
    UPDATE_ACCESS: reduceUpdateAccess
};

export const reducer = createReducerFromMap(bankState, reducers);

// Helpers.
function sortAccounts(accounts) {
    accounts.sort((a, b) => localeComparator(a.title, b.title));
}

function sortOperations(ops) {
    // Sort by -date first, then by +title/customLabel.
    ops.sort((a, b) => {
        let ad = +a.date,
            bd = +b.date;
        if (ad < bd)
            return 1;
        if (ad > bd)
            return -1;
        let ac = a.customLabel && a.customLabel.trim().length ? a.customLabel : a.title;
        let bc = b.customLabel && b.customLabel.trim().length ? b.customLabel : b.title;
        return localeComparator(ac, bc);
    });
}

function sortSelectFields(field) {
    if (maybeHas(field, 'values')) {
        field.values.sort((a, b) => localeComparator(a.label, b.label));
    }
}

function sortBanks(banks) {
    banks.sort((a, b) => localeComparator(a.name, b.name));

    // Sort the selects of customFields by alphabetical order.
    banks.forEach(bank => {
        if (bank.customFields) {
            bank.customFields.forEach(sortSelectFields);
        }
    });
}

// Initial state.
export function initialState(external, allAccounts, allOperations, allAlerts) {

    // Retrieved from outside.
    let { defaultCurrency, defaultAccountId } = external;

    let banks = StaticBanks.map(b => new Bank(b));
    sortBanks(banks);

    let accounts = allAccounts.map(a => new Account(a, defaultCurrency));
    sortAccounts(accounts);

    let accessMap = new Map;
    for (let a of allAccounts) {
        if (!accessMap.has(a.bankAccess)) {
            let access = createAccessFromBankUUID(banks, a.bank, a.bankAccess);
            access.id = a.bankAccess;
            accessMap.set(a.bankAccess, access);
        }
    }
    let accesses = Array.from(accessMap.values());

    let operations = allOperations.map(op => new Operation(op));
    sortOperations(operations);

    let opIds = operations.map(o => o.id);

    let opMap = operations.reduce((map, o) => {
        map[o.id] = o;
        return map;
    }, {});

    let alerts = allAlerts.map(al => new Alert(al));

    // Ui sub-state.
    let currentAccountId = null;
    let currentAccessId = null;

    out:
    for (let access of accesses) {
        for (let account of accountsByAccessId({ accounts }, access.id)) {

            if (account.id === defaultAccountId) {
                currentAccountId = account.id;
                currentAccessId = account.bankAccess;
                // Break from the two loops at once.
                break out;
            }

            if (!currentAccountId) {
                currentAccountId = account.id;
                currentAccessId = account.bankAccess;
            }
        }
    }

    return u({
        banks,
        accesses,
        accounts,
        operations: {
            ids: opIds,
            map: opMap
        },
        alerts,
        currentAccessId,
        currentAccountId,
        processingReason: null,
        constants: {
            defaultCurrency
        }
    }, {});
}

// Getters
export function backgroundProcessingReason(state) {
    return state.processingReason;
}

export function getCurrentAccessId(state) {
    return state.currentAccessId;
}

export function getCurrentAccountId(state) {
    return state.currentAccountId;
}

export function all(state) {
    return state.banks;
}

export function getAccesses(state) {
    return state.accesses;
}

export function accessById(state, accessId) {
    let candidate = state.accesses.find(access => access.id === accessId);
    return typeof candidate !== 'undefined' ? candidate : null;
}

export function accountById(state, accountId) {
    let candidates = state.accounts.filter(account => account.id === accountId);
    return candidates.length ? candidates[0] : null;
}

export function accessByAccountId(state, accountId) {
    let account = accountById(state, accountId);
    if (account === null) {
        return null;
    }
    return accessById(state, account.bankAccess);
}

export function accountsByAccessId(state, accessId) {
    return state.accounts.filter(acc => acc.bankAccess === accessId);
}

export function operationsMap(state) {
    return state.operations.map;
}

export function operationById(state, operationId) {
    let op = state.operations.map[operationId];
    return op ? op : null;
}

export function operationsByAccountId(state, accountId) {
    let { accountNumber } = accountById(state, accountId);
    return state.operations.ids.filter(id => {
        let op = operationById(state, id);
        return op !== null && op.bankAccount === accountNumber;
    });
}

export function alertPairsByType(state, alertType) {
    let pairs = [];

    for (let al of state.alerts.filter(a => a.type === alertType)) {
        let accounts = state.accounts.filter(acc => acc.accountNumber === al.bankAccount);
        if (!accounts.length) {
            debug('alert tied to no accounts, skipping');
            continue;
        }
        pairs.push({ alert: al, account: accounts[0] });
    }

    return pairs;
}
