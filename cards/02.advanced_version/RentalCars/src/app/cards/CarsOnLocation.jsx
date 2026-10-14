import { hubspot } from "@hubspot/ui-extensions";
import { CrmAssociationTable } from "@hubspot/ui-extensions/crm";

hubspot.extend(({ context, actions }) => (
  <Extension context={context} actions={actions} />
));

const Extension = ({ context, actions }) => (
  <CrmAssociationTable
    objectTypeId="p_vehicles"
    propertyColumns={["make", "model", "year", "vin"]}
    quickFilterProperties={["createdate"]}
    pageSize={10}
    searchable={true}
    pagination={true}
  />
);