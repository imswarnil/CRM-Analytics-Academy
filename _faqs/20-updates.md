---
title: Why do I get a 'Field is not available' error in CRM Analytics in dataflow
  ?
date: 2023-12-18 02:52:00 Z
categories:
- Dataflow/Recipie Errors
tags:
- Permisson & Access
---

If you're seeing the 'Field is not available' error in CRM Analytics, it's likely due to the Integration User lacking visibility for a specific field. Here's what you can do:

# Resolution:

## Determine the related Object:
* For data sync, check the node_name, e.g., syncOpportunity.
In dataflows, locate the sfdcDigest node in the dataflow editor.
## Confirm Field Level Security settings:
* Review Field Level Security for the object in the Analytics Cloud Integration User profile.
Ensure the profile has Read Access on the field(s) mentioned in the error.
## Check Managed Package access: 
* If fields are part of a managed package, ensure Integration User has permissions/licenses.

If access can't be granted, consider removing the field from data sync or dataflow.
if field is not visible in data sync that means you also dont have access or field was deleted you can remove field reference by editing dataflow json file.

Restart Dataflow:
After making updates, rerun the data sync, dataflow, or recipe