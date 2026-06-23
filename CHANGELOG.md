# Changelog

## [0.3.0](https://github.com/artimatician/ai-for-developers-project-387/compare/schedule-a-call-v0.2.0...schedule-a-call-v0.3.0) (2026-06-23)


### Features

* prevent 502 on container updates ([c371e99](https://github.com/artimatician/ai-for-developers-project-387/commit/c371e99e5ef450ed8beb2896a7e3b5dca81add6a))


### Bug Fixes

* add opencode config variable ([9cdbeb6](https://github.com/artimatician/ai-for-developers-project-387/commit/9cdbeb660cf26cbd8a91d2da16160f029fe1311d))
* add upstream retry logic to nginx for transient 502 errors ([3067cf8](https://github.com/artimatician/ai-for-developers-project-387/commit/3067cf8eb377adefc6b0b48e8280d56acfe91e12))
* empty `make` output on some terminals ([9507149](https://github.com/artimatician/ai-for-developers-project-387/commit/9507149fdc4f8bd14a407e079292afd8cc518117))
* increase timeout for opencode workflow to 40 minutes ([3c9705f](https://github.com/artimatician/ai-for-developers-project-387/commit/3c9705fec5bb31bd8f58c111ad5544b58bb77efb))

## [0.2.0](https://github.com/artimatician/ai-for-developers-project-387/compare/schedule-a-call-v0.1.1...schedule-a-call-v0.2.0) (2026-06-23)


### Features

* add PORT env var configurability to Docker container ([f9a3788](https://github.com/artimatician/ai-for-developers-project-387/commit/f9a37886b2fd215539c1d7db8fa8bb7b428bab25))
* add production Docker support with 3-stage Dockerfile ([9b77972](https://github.com/artimatician/ai-for-developers-project-387/commit/9b779729164618f6e2720345566ef7e9cbcad39a))
* improve duration UX to clarify maximum vs fixed duration ([e588849](https://github.com/artimatician/ai-for-developers-project-387/commit/e588849962029c9b96d01be1b42bd9554b9630be))
* Update OpenCode workflow configuration ([2daf725](https://github.com/artimatician/ai-for-developers-project-387/commit/2daf72569f82d96198a5423f1928cbe97371a2ff))


### Bug Fixes

* allow blank description in event type create and update ([56cca79](https://github.com/artimatician/ai-for-developers-project-387/commit/56cca7951c365c1bf685e6e379cd45d936093fd3))
* change model ([5eb6086](https://github.com/artimatician/ai-for-developers-project-387/commit/5eb6086215389cb173561af4ebe7fb51c2a4ef88))
* correct indentation ([ff84374](https://github.com/artimatician/ai-for-developers-project-387/commit/ff8437430d1c6b953321083398bfa6ea30700bf5))
* fix model name ([dfc5cf2](https://github.com/artimatician/ai-for-developers-project-387/commit/dfc5cf2b36f34dd1fc9cf65d18098fc607fa7ceb))
* fix the link ([47915d4](https://github.com/artimatician/ai-for-developers-project-387/commit/47915d473b75d1f4091d2dbc1c1758278450cdba))
* include field name in required field error messages ([8d33273](https://github.com/artimatician/ai-for-developers-project-387/commit/8d332737be82e60a340e5065f29554dd2f081914))
* remove duplicate settings block in backend config ([d885c72](https://github.com/artimatician/ai-for-developers-project-387/commit/d885c7252aa46b3bf83be3b8094a3f6245efd684))
* replace nodesource with apt nodejs, fix Next.js binding in Docker setup ([e23eea3](https://github.com/artimatician/ai-for-developers-project-387/commit/e23eea3bcdfc52e0c391e72fab680db41e5da811))


### Miscellaneous Chores

* add release-please for automated release management ([72b98e9](https://github.com/artimatician/ai-for-developers-project-387/commit/72b98e95759786de2367c632a08573fe4b327637))
* archive completed add-docker-support change and sync delta specs ([c798cb5](https://github.com/artimatician/ai-for-developers-project-387/commit/c798cb590fd3eea24adb0878d3c9a71ed3ea44ff))
* configure release-please bootstrap ([b07a39a](https://github.com/artimatician/ai-for-developers-project-387/commit/b07a39aeafecc1d4fa018c66a79712af1a9af253))
* **master:** release schedule-a-call 0.1.1 ([27d3e7d](https://github.com/artimatician/ai-for-developers-project-387/commit/27d3e7df93c111574244cfe69a364eca6da1e1e5))
* **master:** release schedule-a-call 0.1.1 ([ffcbb92](https://github.com/artimatician/ai-for-developers-project-387/commit/ffcbb9294a95d3dba5f9955eb187c79dd581222b))
* remove add-docker-support change directory (archived) ([bb348fb](https://github.com/artimatician/ai-for-developers-project-387/commit/bb348fbecb9914afc1faa69ae4b197cec101b610))
* Update demo link in README ([61f965c](https://github.com/artimatician/ai-for-developers-project-387/commit/61f965c425adaf3b735f70fa9072c55329e84448))


### Documentation

* document PORT env var in README and AGENTS.md ([2a2a78b](https://github.com/artimatician/ai-for-developers-project-387/commit/2a2a78b1cd631d7a41f23abf1870fc2d7f0e1dab))
* rewrite README with concise pitch-first structure ([8ff809a](https://github.com/artimatician/ai-for-developers-project-387/commit/8ff809a5776d212b9119684482feb40689f75be4))
* update add-docker-support design docs to prod-only scope ([f0066c9](https://github.com/artimatician/ai-for-developers-project-387/commit/f0066c9f8fc070ca5cff8e1725e79fe622cfb098))
* update add-docker-support spec files — 5 stages, nginx routing, Option A, dev entrypoint ([cdbfa4e](https://github.com/artimatician/ai-for-developers-project-387/commit/cdbfa4e80233d36f1b47798cd9cf5a4c62944ee1))
* update add-docker-support spec files — 5 stages, nginx routing, Option A, dev entrypoint ([4833d7c](https://github.com/artimatician/ai-for-developers-project-387/commit/4833d7c599f0696f6efbe8a332f9d1eb50ac2d21))


### CI / Build

* add Docker build and smoke test job to CI pipeline ([e7d9e2c](https://github.com/artimatician/ai-for-developers-project-387/commit/e7d9e2c74d6419cad725a249924093d0ef24895b))
* move commit lint to continue-on-error and merge docker-build into test job ([7a85eb4](https://github.com/artimatician/ai-for-developers-project-387/commit/7a85eb48a10ae1bde16db2459854cee86a58e409))

## [0.1.1](https://github.com/artimatician/ai-for-developers-project-386/compare/schedule-a-call-v0.1.0...schedule-a-call-v0.1.1) (2026-06-19)


### Miscellaneous Chores

* configure release-please bootstrap ([c854c7f](https://github.com/artimatician/ai-for-developers-project-386/commit/c854c7ff00bd62a3df5f40157856411572164dbe))
