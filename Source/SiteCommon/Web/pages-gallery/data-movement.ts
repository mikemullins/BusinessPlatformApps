﻿import { DataStoreType } from '../enums/data-store-type';

import { ActionResponse } from '../models/action-response';
import { DataMovementType } from '../models/data-movement-type';
import { ScribeOrganization } from '../models/scribe-organization';

import { ViewModelBase } from '../services/view-model-base';

export class DataMovement extends ViewModelBase {
    dataMovement: string = '';
    dataMovementType: DataMovementType = new DataMovementType();
    password: string = '';
    scribeOrganizationId: string = '';
    scribeOrganizations: ScribeOrganization[] = [];
    username: string = '';

    OnDataMovementChanged(): void {
        this.isValidated = this.dataMovement === this.dataMovementType.ADF;
    }

    async OnLoaded(): Promise<void> {
        this.dataMovement = this.dataMovementType.ADF;
        this.isValidated = true;
    }

    async OnValidate(): Promise<boolean> {
        this.Invalidate();

        switch (this.dataMovement) {
            case this.dataMovementType.Informatica:
                break;
            case this.dataMovementType.Scribe:
                this.MS.DataStore.addToDataStore('ScribeUsername', this.username, DataStoreType.Private);
                this.MS.DataStore.addToDataStore('ScribePassword', this.password, DataStoreType.Private);

                let response: ActionResponse = await this.MS.HttpService.executeAsync('Microsoft-GetScribeOrganizations');

                if (response.IsSuccess) {
                    this.scribeOrganizations = JSON.parse(response.Body.value);

                    if (this.scribeOrganizations && this.scribeOrganizations.length > 0) {
                        this.scribeOrganizationId = this.scribeOrganizations[0].id;

                        this.isValidated = true;
                    }
                }

                break;
        }

        return this.isValidated;
    }

    async NavigatingNext(): Promise<boolean> {
        this.MS.DataStore.addToDataStore('DataMovement', this.dataMovement, DataStoreType.Public);

        switch (this.dataMovement) {
            case this.dataMovementType.Informatica:
                break;
            case this.dataMovementType.Scribe:
                let scribeOrganization: ScribeOrganization = this.scribeOrganizations.find(x => x.id === this.scribeOrganizationId);

                this.MS.DataStore.addToDataStore('ScribeApiToken', scribeOrganization.apiToken, DataStoreType.Private);
                this.MS.DataStore.addToDataStore('ScribeOrganizationId', scribeOrganization.id, DataStoreType.Private);

                break;
        }

        return true;
    }
}