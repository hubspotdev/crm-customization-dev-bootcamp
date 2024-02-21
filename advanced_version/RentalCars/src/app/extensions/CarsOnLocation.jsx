
import {hubspot} from "@hubspot/ui-extensions";
import { CrmAssociationTable } from '@hubspot/ui-extensions/crm';

hubspot.extend(() => (
  <Extension/>
));
const Extension = () => {
  return (
    <CrmAssociationTable
      objectTypeId="2-19860298"
      propertyColumns={['make', 'model', 'year', 'vin']}
      quickFilterProperties={['createdate']}
      pageSize={10} 
      searchable={true}
      pagination={true}
    />
  );
};