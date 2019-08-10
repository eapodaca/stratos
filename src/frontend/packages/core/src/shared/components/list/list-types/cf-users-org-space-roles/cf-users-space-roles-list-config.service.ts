import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { ISpace } from '../../../../../core/cf-api.types';
import { CurrentUserPermissionsService } from '../../../../../core/current-user-permissions.service';
import { ITableColumn } from '../../list-table/table.types';
import { IListConfig, ListViewTypes } from '../../list.component.types';
import { CfUsersSpaceRolesDataSourceService } from './cf-users-space-roles-data-source.service';
import { TableCellRoleOrgSpaceComponent } from './table-cell-org-space-role/table-cell-org-space-role.component';
import { APIResource } from '../../../../../../../store/src/types/api.types';
import { ListView } from '../../../../../../../store/src/actions/list.actions';
import { SpaceUserRoleNames } from '../../../../../../../store/src/types/user.types';
import { AppState } from '../../../../../../../store/src/app-state';
import { selectUsersRolesRoles } from '../../../../../../../store/src/selectors/users-roles.selector';


export class CfUsersSpaceRolesListConfigService implements IListConfig<APIResource<ISpace>> {
  viewType = ListViewTypes.TABLE_ONLY;
  dataSource: CfUsersSpaceRolesDataSourceService;
  defaultView = 'table' as ListView;
  enableTextFilter = true;
  // This is a list of spaces and refresh will update the spaces rather than the roles as might have been expected. Until then disable
  hideRefresh = true;
  text = {
    title: null,
    filter: 'Search by name',
    noEntries: 'There are no spaces'
  };
  columns: ITableColumn<APIResource<ISpace>>[] = [{
    columnId: 'name',
    headerCell: () => 'Space',
    cellDefinition: {
      valuePath: 'entity.name'
    },
    sort: {
      type: 'sort',
      orderKey: 'name',
      field: 'entity.name'
    }
  }, {
    columnId: 'manager',
    headerCell: () => 'Manager',
    cellComponent: TableCellRoleOrgSpaceComponent,
    cellConfig: {
      role: SpaceUserRoleNames.MANAGER,
      isSpace: true
    }
  }, {
    columnId: 'auditor',
    headerCell: () => 'Auditor',
    cellComponent: TableCellRoleOrgSpaceComponent,
    cellConfig: {
      role: SpaceUserRoleNames.AUDITOR,
      isSpace: true
    }
  }, {
    columnId: 'developer',
    headerCell: () => 'Developer',
    cellComponent: TableCellRoleOrgSpaceComponent,
    cellConfig: {
      role: SpaceUserRoleNames.DEVELOPER,
      isSpace: true
    }
  }, {
    columnId: 'spacer',
    headerCell: () => '',
    cellDefinition: {
      getValue: () => ' '
    },
  }];
  initialised = new BehaviorSubject<boolean>(false);

  constructor(private store: Store<AppState>, cfGuid: string, spaceGuid: string, userPerms: CurrentUserPermissionsService) {
    this.store.select(selectUsersRolesRoles).pipe(
      first()
    ).subscribe(newRoles => {
      this.dataSource = new CfUsersSpaceRolesDataSourceService(cfGuid, newRoles.orgGuid, spaceGuid, this.store, userPerms, this);
      this.initialised.next(true);
    });
  }

  getColumns = () => this.columns;
  getGlobalActions = () => [];
  getMultiActions = () => [];
  getSingleActions = () => [];
  getMultiFiltersConfigs = () => [];
  getFilters = () => [];
  getDataSource = () => this.dataSource;
  public getInitialised = () => this.initialised;
}
