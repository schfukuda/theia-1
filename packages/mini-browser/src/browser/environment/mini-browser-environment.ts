/********************************************************************************
 * Copyright (C) 2020 Ericsson and others.
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

import { Endpoint, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables';
import { environment } from '@theia/core/shared/@theia/application-package/lib/environment';
import { inject, injectable, optional, postConstruct } from '@theia/core/shared/inversify';
import { v4 } from 'uuid';
import { MiniBrowserEndpoint } from '../../common/mini-browser-endpoint';
import { MiniBrowserGuard } from '../mini-browser-guard';
import { MiniBrowserConfiguration } from '../mini-browser-configuration';

/**
 * Fetch values from the backend's environment and caches them locally.
 * Helps with deploying various mini-browser endpoints.
 */
@injectable()
export class MiniBrowserEnvironment implements FrontendApplicationContribution {

    protected _hostPatternPromise: Promise<string>;

    @inject(MiniBrowserGuard) @optional()
    protected miniBrowserGuard?: MiniBrowserGuard;

    @inject(MiniBrowserConfiguration)
    protected miniBrowserConfiguration: MiniBrowserConfiguration;

    @inject(EnvVariablesServer)
    protected readonly environment: EnvVariablesServer;

    @postConstruct()
    protected postConstruct(): void {
        this._hostPatternPromise = this.getHostPattern()
            .then(pattern => this.miniBrowserConfiguration.hostPattern = pattern);
        if (this.miniBrowserGuard) {
            this._hostPatternPromise
                .then(pattern => this.miniBrowserGuard!.onSetHostPattern(pattern));
        }
    }

    async onStart(): Promise<void> {
        await this._hostPatternPromise;
    }

    getEndpoint(uuid: string, hostname?: string): Endpoint {
        return new Endpoint({
            path: MiniBrowserEndpoint.PATH,
            host: this.miniBrowserConfiguration.hostPattern!
                .replace('{{uuid}}', uuid)
                .replace('{{hostname}}', hostname || this.getDefaultHostname()),
        });
    }

    getRandomEndpoint(): Endpoint {
        return this.getEndpoint(v4());
    }

    protected async getHostPattern(): Promise<string> {
        return environment.electron.is()
            ? MiniBrowserEndpoint.HOST_PATTERN_DEFAULT
            : this.environment.getValue(MiniBrowserEndpoint.HOST_PATTERN_ENV)
                .then(envVar => envVar?.value || MiniBrowserEndpoint.HOST_PATTERN_DEFAULT);
    }

    protected getDefaultHostname(): string {
        return self.location.host;
    }
}
