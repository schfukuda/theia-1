/********************************************************************************
 * Copyright (C) 2021 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { enableJSDOM } from '../browser/test/jsdom';
let disableJSDOM = enableJSDOM();

import { expect } from 'chai';
import { FrontendApplicationConfigProvider } from './frontend-application-config-provider';

disableJSDOM();

describe('FrontendApplicationConfigProvider', function (): void {

    before(() => disableJSDOM = enableJSDOM());
    after(() => disableJSDOM());

    it('set should use defaults', function (): void {
        FrontendApplicationConfigProvider.set({
            applicationName: 'test', // default is Eclipse Theia
            electron: {
                disallowReloadKeybinding: true, // default is false
            }
        });
        const config = FrontendApplicationConfigProvider.get();
        expect(config.applicationName).equal('test'); // should not be default
        expect(config.defaultIconTheme).equal('none');
        expect(config.defaultTheme).equal('dark');
        expect(config.electron.disallowReloadKeybinding).equal(true); // should not be default
        expect(typeof config.electron.windowOptions).equal('object');
    });
});
