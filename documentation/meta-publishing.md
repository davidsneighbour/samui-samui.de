# Facebook and instagram publishing setup

The project profiles are [Facebook](https://www.facebook.com/samui.samui) and [Instagram](https://www.instagram.com/samuisamui_de). The owner reports that Instagram is linked to the Facebook business account. API access and the exact linked Page still require verification. Threads authorisation is separate and does not grant Facebook or Instagram publishing permissions.

## Integration status

The installed Posthaste coordinator currently supports neither Facebook nor Instagram. Track the adapter and account setup in [the integration issue](https://github.com/davidsneighbour/samui-samui.de/issues/1768). Do not add these network names to `.posthaste.toml` until the consuming runtime supports them.

## Account and application setup

For the Facebook Login route, Instagram must be a professional Business or Creator account linked to the Facebook Page. Confirm that `samuisamui_de` has this account type and that the managing Facebook user has publishing access to the intended Page. The linked profiles alone do not establish these permissions.

In Meta for Developers, inspect whether the existing application offers Facebook Page and Instagram publishing use cases. If the Threads application cannot add those use cases, create a separate application for Facebook and Instagram. The dashboard's available use cases determine the next steps; do not assume the Threads app can be extended.

The expected Facebook Login permissions for the combined workflow are `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, and `instagram_content_publish`. Meta may require additional business-related permissions for the particular portfolio; request those only if the account discovery or dashboard requires them. Authorise the managing user, obtain the target Page access token, and discover the linked Instagram professional account ID. Store all credential values in the ignored `.posthaste/.env`, never in tracked configuration or documentation.

## Post formats and verification

Facebook Page posts can contain text and a website link. Instagram publishing requires media and a caption; the existing text-only introduction is not sufficient. The initial Instagram adapter should support a single image with a caption. Select and approve its image before publishing. Meta must be able to fetch the image from a public HTTPS URL for the image-container workflow.

Before publishing, verify the Facebook Page ID and name, the Instagram account ID and username, and token permissions. A credential or payload check is not proof that publishing will succeed. Record each confirmed publication in the repository-local history, and report the actual API result and permalink.

## References

* [Meta's Instagram API collection](https://www.postman.com/meta/workspace/instagram/documentation/23987686-9386f468-7714-490f-9bfc-9442db5c8f00) documents the Facebook Login route and professional-account requirement.
* [Meta's Facebook API collection](https://www.postman.com/meta/facebook/documentation/r56bjfd/facebook-api?entity=request-23987686-0b79260c-96bd-49de-875b-6076213785fc) documents discovering managed Pages and their access tokens.
