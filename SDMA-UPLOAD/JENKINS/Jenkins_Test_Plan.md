# Jenkins Test Plan

| # | Test Name | Test Description | Environment | Status | Comments |
|---|-----------|-----------------|-------------|--------|----------|
| 1 | GitLab workflow | Test that the new standardised GitLab workflow works end to end and can be executed on all worker nodes. | DEV / PROD | | |
| 2 | Jenkins job triggers | Test that Jenkins job can be triggered by a GP service, or other required mechanisms (please add on other lines). | DEV / PROD | | |
| 3 | Service account permissions/access | Test that the following service accounts are able to execute jobs on NPE and PROD respectively: `APAC\SA_SVC_Jenkins_NPE`, `APAC\SA_SVC_Jenkins_PRD` | DEV / PROD | | List what directories these service accounts need access to: |
| 4 | User permissions | Check access permissions are as expected based on security matrix. | DEV / PROD | | |
| 5 | Python 3 Libraries | Test that a Jenkins job utilising arcpy libraries and additional yaml and fpdf libraries can successfully run on all nodes. | DEV / PROD | | 1. Missing python scripting shell module in Jenkins. <br /> 2. Tested trying to import ArcPy — RuntimeError: The Product License has not been initialized. <br /> 3. Python system environment variables not created to point to the ArcPy environment. Added to server `mauel1edwjw001` but still not able to reference `python.exe` from Jenkins command. |
| 6 | Python Environment Variables | Test that Jenkins correctly resolves different Python environment variables on all worker nodes: `GCC_ArcPy3`, `GCC_ArcPy2`, `GCC_VulcanV12` | DEV / PROD | | Verify each variable points to the correct Python executable and that the corresponding ArcPy / Vulcan licence is accessible. |
| 7 | Python 2 Libraries | Test that Jenkins can run a job that utilises arcpy 2 libraries on the relevant worker nodes. | DEV / PROD | | |
| 8 | FME | Test that Jenkins can run an FME workbench on the relevant worker node. | DEV / PROD | | |
| 9 | SQL Connectivity | Test that Jenkins can run a job that reads/writes to an Enterprise Geodatabase on each worker node. | DEV / PROD | | |
| 10 | Vulcan | Test that Jenkins can run a job that utilises Vulcan. | DEV / PROD | | |
| 11 | SMTP Email Server | Test that Jenkins can send notification emails via the configured SMTP server. | DEV / PROD | | |
| 12 | Jenkins Email Setup | Verify Jenkins email notification is fully configured: SMTP host/port, authentication, default recipients, and trigger conditions (success, failure, unstable). | DEV / PROD | | Confirm emails are received in both DEV and PROD. Check that reply-to address and sender name are correct. |
| 13 | GitLab PAT (Personal Access Token) Setup | Verify that a GitLab Personal Access Token is stored in the Jenkins credentials store and that Jenkins can authenticate to GitLab for repository clone, push, and webhook operations. | DEV / PROD | | Confirm token scope (`read_repository` / `write_repository` / `api`) is sufficient. Check token expiry policy. |
| 14 | .Net | Test that Jenkins can run a job that accesses .Net on the relevant worker node. | DEV / PROD | | |
| 15 | Node JS | Test that Jenkins can run a job that accesses Node JS on the relevant worker node. | DEV / PROD | | |
| 16 | Plugin Installation Check | Create and run a script that outputs the full list of installed Jenkins plugins and their versions, and validates that all required plugins are present on both DEV and PROD controllers/agents. | DEV / PROD | | Use Jenkins Script Console (Groovy): `Jenkins.instance.pluginManager.plugins.each { println "${it.getShortName()} - ${it.getVersion()}" }` |
| 17 | Job Chaining (Call one Jenkins job from another) | Test that one Jenkins job can successfully trigger a downstream Jenkins job, pass parameters, and correctly report the downstream result back to the upstream job. | DEV / PROD | | Test using both *Trigger parameterised build* plugin and `pipeline: build step` in a declarative pipeline. |
| 18 | Multiphase / Multi-Stage Jobs | Test that a Jenkins declarative pipeline can execute multiple sequential and parallel stages (e.g., Checkout → Build → Test → Package → Deploy) with correct stage gating, failure handling, and post-actions. | DEV / PROD | | Validate that a stage failure correctly halts downstream stages and sends a notification. |

---

## Status Key

| Status | Meaning |
|--------|---------|
| Pass | Test completed successfully |
| Fail | Test failed — see Comments |
| In Progress | Currently being tested |
| Not Started | Not yet begun |
| Blocked | Cannot proceed — dependency unresolved |

---

## Notes

- **NPE** = Non-Production Environment
- **PROD** = Production Environment
- **GCC_ArcPy3** — Points to ArcGIS Pro Python 3 environment
- **GCC_ArcPy2** — Points to ArcMap Python 2 environment
- **GCC_VulcanV12** — Points to Vulcan V12 Python environment
- Service accounts must have appropriate directory access on each worker node
- All tests should be executed on **all relevant worker nodes**, not just the controller
