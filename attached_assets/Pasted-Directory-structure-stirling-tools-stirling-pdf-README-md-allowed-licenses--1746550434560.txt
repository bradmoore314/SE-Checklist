Directory structure:
└── stirling-tools-stirling-pdf/
    ├── README.md
    ├── allowed-licenses.json
    ├── CONTRIBUTING.md
    ├── DATABASE.md
    ├── DeveloperGuide.md
    ├── Dockerfile
    ├── Dockerfile.dev
    ├── Dockerfile.fat
    ├── Dockerfile.ultra-lite
    ├── gradle.properties
    ├── gradlew
    ├── gradlew.bat
    ├── HowToAddNewLanguage.md
    ├── HowToUseOCR.md
    ├── lauch4jConfig.xml
    ├── LICENSE
    ├── SECURITY.md
    ├── USERS.md
    ├── .editorconfig
    ├── .git-blame-ignore-revs
    ├── .pre-commit-config.yaml
    ├── docs/
    ├── exampleYmlFiles/
    │   ├── docker-compose-latest-fat-endpoints-disabled.yml
    │   ├── docker-compose-latest-fat-security-postgres.yml
    │   ├── docker-compose-latest-fat-security.yml
    │   ├── docker-compose-latest-security-with-sso.yml
    │   ├── docker-compose-latest-security.yml
    │   ├── docker-compose-latest-ultra-lite-security.yml
    │   ├── docker-compose-latest-ultra-lite.yml
    │   ├── docker-compose-latest.yml
    │   └── test_cicd.yml
    ├── gradle/
    │   └── wrapper/
    │       └── gradle-wrapper.properties
    ├── images/
    ├── pipeline/
    │   └── defaultWebUIConfigs/
    │       ├── OCR images.json
    │       ├── Prepare-pdfs-for-email.json
    │       └── split-rotate-auto-rename.json
    ├── scripts/
    │   ├── counter_translation.py
    │   ├── download-security-jar.sh
    │   ├── ignore_translation.toml
    │   ├── init-without-ocr.sh
    │   ├── init.sh
    │   ├── installFonts.sh
    │   ├── png_to_webp.py
    │   ├── PropSync.java
    │   ├── remove_translation_keys.sh
    │   ├── replace_translation_line.sh
    │   └── split_photos.py
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   ├── org/
    │   │   │   │   └── apache/
    │   │   │   │       └── pdfbox/
    │   │   │   │           └── examples/
    │   │   │   │               ├── signature/
    │   │   │   │               │   ├── CMSProcessableInputStream.java
    │   │   │   │               │   ├── CreateSignatureBase.java
    │   │   │   │               │   ├── TSAClient.java
    │   │   │   │               │   └── ValidationTimeStamp.java
    │   │   │   │               └── util/
    │   │   │   │                   ├── ConnectedInputStream.java
    │   │   │   │                   └── DeletingRandomAccessFile.java
    │   │   │   └── stirling/
    │   │   │       └── software/
    │   │   │           └── SPDF/
    │   │   │               ├── LibreOfficeListener.java
    │   │   │               ├── SPDFApplication.java
    │   │   │               ├── config/
    │   │   │               │   ├── AppConfig.java
    │   │   │               │   ├── AppUpdateService.java
    │   │   │               │   ├── CleanUrlInterceptor.java
    │   │   │               │   ├── ConfigInitializer.java
    │   │   │               │   ├── EndpointConfiguration.java
    │   │   │               │   ├── EndpointInspector.java
    │   │   │               │   ├── EndpointInterceptor.java
    │   │   │               │   ├── EnterpriseEndpointFilter.java
    │   │   │               │   ├── ExternalAppDepConfig.java
    │   │   │               │   ├── FileFallbackTemplateResolver.java
    │   │   │               │   ├── InitialSetup.java
    │   │   │               │   ├── InstallationPathConfig.java
    │   │   │               │   ├── LocaleConfiguration.java
    │   │   │               │   ├── LogbackPropertyLoader.java
    │   │   │               │   ├── MetricsConfig.java
    │   │   │               │   ├── MetricsFilter.java
    │   │   │               │   ├── OpenApiConfig.java
    │   │   │               │   ├── PostHogConfig.java
    │   │   │               │   ├── PostHogLoggerImpl.java
    │   │   │               │   ├── RuntimePathConfig.java
    │   │   │               │   ├── StartupApplicationListener.java
    │   │   │               │   ├── WebMvcConfig.java
    │   │   │               │   ├── YamlHelper.java
    │   │   │               │   ├── YamlPropertySourceFactory.java
    │   │   │               │   ├── fingerprint/
    │   │   │               │   │   ├── FingerprintBasedSessionFilter.java
    │   │   │               │   │   ├── FingerprintBasedSessionManager.java
    │   │   │               │   │   └── FingerprintGenerator.java
    │   │   │               │   ├── interfaces/
    │   │   │               │   │   ├── DatabaseInterface.java
    │   │   │               │   │   └── ShowAdminInterface.java
    │   │   │               │   └── security/
    │   │   │               │       ├── AppUpdateAuthService.java
    │   │   │               │       ├── CustomAuthenticationFailureHandler.java
    │   │   │               │       ├── CustomAuthenticationSuccessHandler.java
    │   │   │               │       ├── CustomLogoutSuccessHandler.java
    │   │   │               │       ├── CustomUserDetailsService.java
    │   │   │               │       ├── FirstLoginFilter.java
    │   │   │               │       ├── InitialSecuritySetup.java
    │   │   │               │       ├── IPRateLimitingFilter.java
    │   │   │               │       ├── LoginAttemptService.java
    │   │   │               │       ├── RateLimitResetScheduler.java
    │   │   │               │       ├── SecurityConfiguration.java
    │   │   │               │       ├── UserAuthenticationFilter.java
    │   │   │               │       ├── UserBasedRateLimitingFilter.java
    │   │   │               │       ├── UserService.java
    │   │   │               │       ├── database/
    │   │   │               │       │   ├── DatabaseConfig.java
    │   │   │               │       │   ├── DatabaseService.java
    │   │   │               │       │   └── ScheduledTasks.java
    │   │   │               │       ├── oauth2/
    │   │   │               │       │   ├── CustomOAuth2AuthenticationFailureHandler.java
    │   │   │               │       │   ├── CustomOAuth2AuthenticationSuccessHandler.java
    │   │   │               │       │   ├── CustomOAuth2UserService.java
    │   │   │               │       │   └── OAuth2Configuration.java
    │   │   │               │       ├── saml2/
    │   │   │               │       │   ├── CertificateUtils.java
    │   │   │               │       │   ├── CustomSaml2AuthenticatedPrincipal.java
    │   │   │               │       │   ├── CustomSaml2AuthenticationFailureHandler.java
    │   │   │               │       │   ├── CustomSaml2AuthenticationSuccessHandler.java
    │   │   │               │       │   ├── CustomSaml2ResponseAuthenticationConverter.java
    │   │   │               │       │   └── SAML2Configuration.java
    │   │   │               │       └── session/
    │   │   │               │           ├── CustomHttpSessionListener.java
    │   │   │               │           ├── SessionPersistentRegistry.java
    │   │   │               │           ├── SessionRegistryConfig.java
    │   │   │               │           ├── SessionRepository.java
    │   │   │               │           └── SessionScheduled.java
    │   │   │               ├── controller/
    │   │   │               │   ├── api/
    │   │   │               │   │   ├── AdditionalLanguageJsController.java
    │   │   │               │   │   ├── AnalysisController.java
    │   │   │               │   │   ├── CropController.java
    │   │   │               │   │   ├── DatabaseController.java
    │   │   │               │   │   ├── H2SQLCondition.java
    │   │   │               │   │   ├── MergeController.java
    │   │   │               │   │   ├── MultiPageLayoutController.java
    │   │   │               │   │   ├── PdfImageRemovalController.java
    │   │   │               │   │   ├── PdfOverlayController.java
    │   │   │               │   │   ├── RearrangePagesPDFController.java
    │   │   │               │   │   ├── RotationController.java
    │   │   │               │   │   ├── ScalePagesController.java
    │   │   │               │   │   ├── SettingsController.java
    │   │   │               │   │   ├── SplitPdfByChaptersController.java
    │   │   │               │   │   ├── SplitPdfBySectionsController.java
    │   │   │               │   │   ├── SplitPdfBySizeController.java
    │   │   │               │   │   ├── SplitPDFController.java
    │   │   │               │   │   ├── ToSinglePageController.java
    │   │   │               │   │   ├── UserController.java
    │   │   │               │   │   ├── converters/
    │   │   │               │   │   │   ├── ConvertHtmlToPDF.java
    │   │   │               │   │   │   ├── ConvertImgPDFController.java
    │   │   │               │   │   │   ├── ConvertMarkdownToPdf.java
    │   │   │               │   │   │   ├── ConvertOfficeController.java
    │   │   │               │   │   │   ├── ConvertPDFToHtml.java
    │   │   │               │   │   │   ├── ConvertPDFToOffice.java
    │   │   │               │   │   │   ├── ConvertPDFToPDFA.java
    │   │   │               │   │   │   ├── ConvertWebsiteToPDF.java
    │   │   │               │   │   │   └── ExtractCSVController.java
    │   │   │               │   │   ├── filters/
    │   │   │               │   │   │   └── FilterController.java
    │   │   │               │   │   ├── misc/
    │   │   │               │   │   │   ├── AutoRenameController.java
    │   │   │               │   │   │   ├── AutoSplitPdfController.java
    │   │   │               │   │   │   ├── BlankPageController.java
    │   │   │               │   │   │   ├── CompressController.java
    │   │   │               │   │   │   ├── DecompressPdfController.java
    │   │   │               │   │   │   ├── ExtractImageScansController.java
    │   │   │               │   │   │   ├── ExtractImagesController.java
    │   │   │               │   │   │   ├── FakeScanControllerWIP.java
    │   │   │               │   │   │   ├── FlattenController.java
    │   │   │               │   │   │   ├── MetadataController.java
    │   │   │               │   │   │   ├── OCRController.java
    │   │   │               │   │   │   ├── OverlayImageController.java
    │   │   │               │   │   │   ├── PageNumbersController.java
    │   │   │               │   │   │   ├── PrintFileController.java
    │   │   │               │   │   │   ├── RepairController.java
    │   │   │               │   │   │   ├── ReplaceAndInvertColorController.java
    │   │   │               │   │   │   ├── ShowJavascript.java
    │   │   │               │   │   │   ├── StampController.java
    │   │   │               │   │   │   └── UnlockPDFFormsController.java
    │   │   │               │   │   ├── pipeline/
    │   │   │               │   │   │   ├── ApiDocService.java
    │   │   │               │   │   │   ├── PipelineController.java
    │   │   │               │   │   │   ├── PipelineDirectoryProcessor.java
    │   │   │               │   │   │   ├── PipelineProcessor.java
    │   │   │               │   │   │   └── UserServiceInterface.java
    │   │   │               │   │   └── security/
    │   │   │               │   │       ├── CertSignController.java
    │   │   │               │   │       ├── GetInfoOnPDF.java
    │   │   │               │   │       ├── PasswordController.java
    │   │   │               │   │       ├── RedactController.java
    │   │   │               │   │       ├── RemoveCertSignController.java
    │   │   │               │   │       ├── SanitizeController.java
    │   │   │               │   │       ├── ValidateSignatureController.java
    │   │   │               │   │       └── WatermarkController.java
    │   │   │               │   └── web/
    │   │   │               │       ├── AccountWebController.java
    │   │   │               │       ├── ConverterWebController.java
    │   │   │               │       ├── DatabaseWebController.java
    │   │   │               │       ├── GeneralWebController.java
    │   │   │               │       ├── HomeWebController.java
    │   │   │               │       ├── MetricsController.java
    │   │   │               │       ├── OtherWebController.java
    │   │   │               │       ├── SecurityWebController.java
    │   │   │               │       ├── SignatureController.java
    │   │   │               │       └── UploadLimitService.java
    │   │   │               ├── EE/
    │   │   │               │   ├── EEAppConfig.java
    │   │   │               │   ├── KeygenLicenseVerifier.java
    │   │   │               │   └── LicenseKeyChecker.java
    │   │   │               ├── Factories/
    │   │   │               │   └── ReplaceAndInvertColorFactory.java
    │   │   │               ├── model/
    │   │   │               │   ├── ApiEndpoint.java
    │   │   │               │   ├── ApiKeyAuthenticationToken.java
    │   │   │               │   ├── ApplicationProperties.java
    │   │   │               │   ├── AttemptCounter.java
    │   │   │               │   ├── AuthenticationType.java
    │   │   │               │   ├── Authority.java
    │   │   │               │   ├── Dependency.java
    │   │   │               │   ├── InputStreamTemplateResource.java
    │   │   │               │   ├── PdfMetadata.java
    │   │   │               │   ├── PDFText.java
    │   │   │               │   ├── PersistentLogin.java
    │   │   │               │   ├── PipelineConfig.java
    │   │   │               │   ├── PipelineOperation.java
    │   │   │               │   ├── PipelineResult.java
    │   │   │               │   ├── Role.java
    │   │   │               │   ├── SessionEntity.java
    │   │   │               │   ├── SignatureFile.java
    │   │   │               │   ├── SortTypes.java
    │   │   │               │   ├── User.java
    │   │   │               │   ├── UsernameAttribute.java
    │   │   │               │   ├── api/
    │   │   │               │   │   ├── GeneralFile.java
    │   │   │               │   │   ├── HandleDataRequest.java
    │   │   │               │   │   ├── ImageFile.java
    │   │   │               │   │   ├── MultiplePDFFiles.java
    │   │   │               │   │   ├── PDFComparison.java
    │   │   │               │   │   ├── PDFComparisonAndCount.java
    │   │   │               │   │   ├── PDFExtractImagesRequest.java
    │   │   │               │   │   ├── PDFFile.java
    │   │   │               │   │   ├── PDFWithImageFormatRequest.java
    │   │   │               │   │   ├── PDFWithPageNums.java
    │   │   │               │   │   ├── PDFWithPageSize.java
    │   │   │               │   │   ├── SplitPdfByChaptersRequest.java
    │   │   │               │   │   ├── SplitPdfBySectionsRequest.java
    │   │   │               │   │   ├── converters/
    │   │   │               │   │   │   ├── ConvertPDFToMarkdown.java
    │   │   │               │   │   │   ├── ConvertToImageRequest.java
    │   │   │               │   │   │   ├── ConvertToPdfRequest.java
    │   │   │               │   │   │   ├── HTMLToPdfRequest.java
    │   │   │               │   │   │   ├── PdfToBookRequest.java
    │   │   │               │   │   │   ├── PdfToPdfARequest.java
    │   │   │               │   │   │   ├── PdfToPresentationRequest.java
    │   │   │               │   │   │   ├── PdfToTextOrRTFRequest.java
    │   │   │               │   │   │   ├── PdfToWordRequest.java
    │   │   │               │   │   │   └── UrlToPdfRequest.java
    │   │   │               │   │   ├── filter/
    │   │   │               │   │   │   ├── ContainsTextRequest.java
    │   │   │               │   │   │   ├── FileSizeRequest.java
    │   │   │               │   │   │   ├── PageRotationRequest.java
    │   │   │               │   │   │   └── PageSizeRequest.java
    │   │   │               │   │   ├── general/
    │   │   │               │   │   │   ├── CropPdfForm.java
    │   │   │               │   │   │   ├── MergeMultiplePagesRequest.java
    │   │   │               │   │   │   ├── MergePdfsRequest.java
    │   │   │               │   │   │   ├── OverlayPdfsRequest.java
    │   │   │               │   │   │   ├── RearrangePagesRequest.java
    │   │   │               │   │   │   ├── RotatePDFRequest.java
    │   │   │               │   │   │   ├── ScalePagesRequest.java
    │   │   │               │   │   │   └── SplitPdfBySizeOrCountRequest.java
    │   │   │               │   │   ├── misc/
    │   │   │               │   │   │   ├── AddPageNumbersRequest.java
    │   │   │               │   │   │   ├── AddStampRequest.java
    │   │   │               │   │   │   ├── AutoSplitPdfRequest.java
    │   │   │               │   │   │   ├── ExtractHeaderRequest.java
    │   │   │               │   │   │   ├── ExtractImageScansRequest.java
    │   │   │               │   │   │   ├── FlattenRequest.java
    │   │   │               │   │   │   ├── HighContrastColorCombination.java
    │   │   │               │   │   │   ├── MetadataRequest.java
    │   │   │               │   │   │   ├── OptimizePdfRequest.java
    │   │   │               │   │   │   ├── OverlayImageRequest.java
    │   │   │               │   │   │   ├── PrintFileRequest.java
    │   │   │               │   │   │   ├── ProcessPdfWithOcrRequest.java
    │   │   │               │   │   │   ├── RemoveBlankPagesRequest.java
    │   │   │               │   │   │   ├── ReplaceAndInvert.java
    │   │   │               │   │   │   └── ReplaceAndInvertColorRequest.java
    │   │   │               │   │   ├── security/
    │   │   │               │   │   │   ├── AddPasswordRequest.java
    │   │   │               │   │   │   ├── AddWatermarkRequest.java
    │   │   │               │   │   │   ├── ManualRedactPdfRequest.java
    │   │   │               │   │   │   ├── PDFPasswordRequest.java
    │   │   │               │   │   │   ├── RedactionArea.java
    │   │   │               │   │   │   ├── RedactPdfRequest.java
    │   │   │               │   │   │   ├── SanitizePdfRequest.java
    │   │   │               │   │   │   ├── SignatureValidationRequest.java
    │   │   │               │   │   │   ├── SignatureValidationResult.java
    │   │   │               │   │   │   └── SignPDFWithCertRequest.java
    │   │   │               │   │   └── user/
    │   │   │               │   │       ├── UpdateUserDetails.java
    │   │   │               │   │       ├── UpdateUserUsername.java
    │   │   │               │   │       ├── Username.java
    │   │   │               │   │       └── UsernameAndPass.java
    │   │   │               │   ├── exception/
    │   │   │               │   │   ├── BackupNotFoundException.java
    │   │   │               │   │   ├── NoProviderFoundException.java
    │   │   │               │   │   ├── UnsupportedProviderException.java
    │   │   │               │   │   └── UnsupportedUsernameAttribute.java
    │   │   │               │   └── provider/
    │   │   │               │       ├── GitHubProvider.java
    │   │   │               │       ├── GoogleProvider.java
    │   │   │               │       ├── KeycloakProvider.java
    │   │   │               │       └── Provider.java
    │   │   │               ├── pdf/
    │   │   │               │   ├── FlexibleCSVWriter.java
    │   │   │               │   └── TextFinder.java
    │   │   │               ├── repository/
    │   │   │               │   ├── AuthorityRepository.java
    │   │   │               │   ├── JPATokenRepositoryImpl.java
    │   │   │               │   ├── PersistentLoginRepository.java
    │   │   │               │   └── UserRepository.java
    │   │   │               ├── service/
    │   │   │               │   ├── CertificateValidationService.java
    │   │   │               │   ├── CustomPDFDocumentFactory.java
    │   │   │               │   ├── LanguageService.java
    │   │   │               │   ├── MetricsAggregatorService.java
    │   │   │               │   ├── PdfImageRemovalService.java
    │   │   │               │   ├── PdfMetadataService.java
    │   │   │               │   ├── PostHogService.java
    │   │   │               │   ├── SignatureService.java
    │   │   │               │   └── misc/
    │   │   │               │       └── ReplaceAndInvertColorService.java
    │   │   │               ├── UI/
    │   │   │               │   ├── WebBrowser.java
    │   │   │               │   └── impl/
    │   │   │               │       ├── DesktopBrowser.java
    │   │   │               │       └── LoadingWindow.java
    │   │   │               └── utils/
    │   │   │                   ├── CheckProgramInstall.java
    │   │   │                   ├── CustomHtmlSanitizer.java
    │   │   │                   ├── ErrorUtils.java
    │   │   │                   ├── FileInfo.java
    │   │   │                   ├── FileMonitor.java
    │   │   │                   ├── FileToPdf.java
    │   │   │                   ├── GeneralUtils.java
    │   │   │                   ├── ImageProcessingUtils.java
    │   │   │                   ├── PDFToFile.java
    │   │   │                   ├── PdfUtils.java
    │   │   │                   ├── ProcessExecutor.java
    │   │   │                   ├── PropertyConfigs.java
    │   │   │                   ├── RequestUriUtils.java
    │   │   │                   ├── UIScaling.java
    │   │   │                   ├── UrlUtils.java
    │   │   │                   ├── WebResponseUtils.java
    │   │   │                   ├── misc/
    │   │   │                   │   ├── CustomColorReplaceStrategy.java
    │   │   │                   │   ├── HighContrastColorReplaceDecider.java
    │   │   │                   │   ├── InvertFullColorStrategy.java
    │   │   │                   │   ├── PdfTextStripperCustom.java
    │   │   │                   │   └── ReplaceAndInvertColorStrategy.java
    │   │   │                   ├── propertyeditor/
    │   │   │                   │   ├── StringToArrayListPropertyEditor.java
    │   │   │                   │   └── StringToMapPropertyEditor.java
    │   │   │                   └── validation/
    │   │   │                       └── Validator.java
    │   │   └── resources/
    │   │       ├── application.properties
    │   │       ├── banner.txt
    │   │       ├── certdata.txt
    │   │       ├── logback.xml
    │   │       ├── messages.properties
    │   │       ├── messages_ar_AR.properties
    │   │       ├── messages_az_AZ.properties
    │   │       ├── messages_bg_BG.properties
    │   │       ├── messages_ca_CA.properties
    │   │       ├── messages_cs_CZ.properties
    │   │       ├── messages_da_DK.properties
    │   │       ├── messages_de_DE.properties
    │   │       ├── messages_el_GR.properties
    │   │       ├── messages_en_GB.properties
    │   │       ├── messages_en_US.properties
    │   │       ├── messages_es_ES.properties
    │   │       ├── messages_eu_ES.properties
    │   │       ├── messages_fa_IR.properties
    │   │       ├── messages_fr_FR.properties
    │   │       ├── messages_ga_IE.properties
    │   │       ├── messages_hi_IN.properties
    │   │       ├── messages_hr_HR.properties
    │   │       ├── messages_hu_HU.properties
    │   │       ├── messages_id_ID.properties
    │   │       ├── messages_it_IT.properties
    │   │       ├── messages_ja_JP.properties
    │   │       ├── messages_ko_KR.properties
    │   │       ├── messages_nl_NL.properties
    │   │       ├── messages_no_NB.properties
    │   │       ├── messages_pl_PL.properties
    │   │       ├── messages_pt_BR.properties
    │   │       ├── messages_pt_PT.properties
    │   │       ├── messages_ro_RO.properties
    │   │       ├── messages_ru_RU.properties
    │   │       ├── messages_sk_SK.properties
    │   │       ├── messages_sl_SI.properties
    │   │       ├── messages_sr_LATN_RS.properties
    │   │       ├── messages_sv_SE.properties
    │   │       ├── messages_th_TH.properties
    │   │       ├── messages_tr_TR.properties
    │   │       ├── messages_uk_UA.properties
    │   │       ├── messages_vi_VN.properties
    │   │       ├── messages_zh_BO.properties
    │   │       ├── messages_zh_CN.properties
    │   │       ├── messages_zh_TW.properties
    │   │       ├── settings.yml.template
    │   │       ├── static/
    │   │       │   ├── 3rdPartyLicenses.json
    │   │       │   ├── browserconfig.xml
    │   │       │   ├── favicon.icns
    │   │       │   ├── manifest.json
    │   │       │   ├── site.webmanifest
    │   │       │   ├── css/
    │   │       │   │   ├── account.css
    │   │       │   │   ├── add-image.css
    │   │       │   │   ├── bootstrap-icons.css
    │   │       │   │   ├── cookieconsent.css
    │   │       │   │   ├── cookieconsentCustomisation.css
    │   │       │   │   ├── dragdrop.css
    │   │       │   │   ├── error.css
    │   │       │   │   ├── errorBanner.css
    │   │       │   │   ├── fileSelect.css
    │   │       │   │   ├── footer.css
    │   │       │   │   ├── game.css
    │   │       │   │   ├── general.css
    │   │       │   │   ├── home-legacy.css
    │   │       │   │   ├── home.css
    │   │       │   │   ├── imageHighlighter.css
    │   │       │   │   ├── licenses.css
    │   │       │   │   ├── login.css
    │   │       │   │   ├── merge.css
    │   │       │   │   ├── multi-tool.css
    │   │       │   │   ├── navbar.css
    │   │       │   │   ├── pdfActions.css
    │   │       │   │   ├── pipeline.css
    │   │       │   │   ├── prism.css
    │   │       │   │   ├── rainbow-mode.css
    │   │       │   │   ├── redact.css
    │   │       │   │   ├── removeImage.css
    │   │       │   │   ├── rotate-pdf.css
    │   │       │   │   ├── sign.css
    │   │       │   │   ├── split-pdf-by-sections.css
    │   │       │   │   ├── stamp.css
    │   │       │   │   ├── tab-container.css
    │   │       │   │   ├── usage.css
    │   │       │   │   ├── fonts/
    │   │       │   │   │   ├── bootstrap-icons.woff
    │   │       │   │   │   └── bootstrap-icons.woff2
    │   │       │   │   └── theme/
    │   │       │   │       ├── componentes.css
    │   │       │   │       ├── font.css
    │   │       │   │       ├── theme.css
    │   │       │   │       ├── theme.dark.css
    │   │       │   │       └── theme.light.css
    │   │       │   ├── files/
    │   │       │   │   └── popularity.txt
    │   │       │   ├── fonts/
    │   │       │   │   ├── Arimo-Regular.woff2
    │   │       │   │   ├── DancingScript-Regular.woff2
    │   │       │   │   ├── Estonia.woff2
    │   │       │   │   ├── google-symbol.woff2
    │   │       │   │   ├── IndieFlower-Regular.woff2
    │   │       │   │   ├── malgun.ttf
    │   │       │   │   ├── Meiryo.ttf
    │   │       │   │   ├── NotoSans-Regular.ttf
    │   │       │   │   ├── NotoSansArabic-Regular.ttf
    │   │       │   │   ├── NotoSansJP-Regular.ttf
    │   │       │   │   ├── NotoSansSC-Regular.ttf
    │   │       │   │   ├── SimSun.ttf
    │   │       │   │   ├── Tangerine.woff2
    │   │       │   │   ├── Tinos-Regular.woff2
    │   │       │   │   └── static/
    │   │       │   │       ├── NotoSansArabic-Regular.ttf
    │   │       │   │       └── NotoSansJP-Regular.ttf
    │   │       │   ├── images/
    │   │       │   ├── js/
    │   │       │   │   ├── cacheFormInputs.js
    │   │       │   │   ├── csrf.js
    │   │       │   │   ├── darkmode.js
    │   │       │   │   ├── DecryptFiles.js
    │   │       │   │   ├── download.js
    │   │       │   │   ├── downloader.js
    │   │       │   │   ├── draggable-utils.js
    │   │       │   │   ├── errorBanner.js
    │   │       │   │   ├── favourites.js
    │   │       │   │   ├── fetch-utils.js
    │   │       │   │   ├── file-icon-factory.js
    │   │       │   │   ├── file-utils.js
    │   │       │   │   ├── fileInput.js
    │   │       │   │   ├── game.js
    │   │       │   │   ├── githubVersion.js
    │   │       │   │   ├── googleFilePicker.js
    │   │       │   │   ├── homecard-legacy.js
    │   │       │   │   ├── homecard.js
    │   │       │   │   ├── languageSelection.js
    │   │       │   │   ├── local-pdf-input-download.js
    │   │       │   │   ├── merge.js
    │   │       │   │   ├── navbar.js
    │   │       │   │   ├── pipeline.js
    │   │       │   │   ├── redact.js
    │   │       │   │   ├── search.js
    │   │       │   │   ├── settings.js
    │   │       │   │   ├── tab-container.js
    │   │       │   │   ├── usage.js
    │   │       │   │   ├── uuid.js
    │   │       │   │   ├── compare/
    │   │       │   │   │   ├── diff.js
    │   │       │   │   │   └── pdfWorker.js
    │   │       │   │   ├── multitool/
    │   │       │   │   │   ├── DragDropManager.js
    │   │       │   │   │   ├── ImageHighlighter.js
    │   │       │   │   │   ├── PdfActionsManager.js
    │   │       │   │   │   ├── PdfContainer.js
    │   │       │   │   │   ├── UndoManager.js
    │   │       │   │   │   └── commands/
    │   │       │   │   │       ├── add-page.js
    │   │       │   │   │       ├── command.js
    │   │       │   │   │       ├── commands-sequence.js
    │   │       │   │   │       ├── delete-page.js
    │   │       │   │   │       ├── move-page.js
    │   │       │   │   │       ├── page-break.js
    │   │       │   │   │       ├── remove.js
    │   │       │   │   │       ├── rotate.js
    │   │       │   │   │       ├── select.js
    │   │       │   │   │       └── split.js
    │   │       │   │   ├── pages/
    │   │       │   │   │   ├── add-image.js
    │   │       │   │   │   ├── adjust-contrast.js
    │   │       │   │   │   ├── change-metadata.js
    │   │       │   │   │   ├── crop.js
    │   │       │   │   │   ├── home.js
    │   │       │   │   │   ├── pdf-to-csv.js
    │   │       │   │   │   └── sign.js
    │   │       │   │   ├── sign/
    │   │       │   │   │   └── signature-canvas.js
    │   │       │   │   └── thirdParty/
    │   │       │   │       ├── cookieconsent-config.js
    │   │       │   │       ├── cookieconsent.umd.js
    │   │       │   │       ├── fontfaceobserver.standalone.js
    │   │       │   │       └── prism.js
    │   │       │   └── pdfjs-legacy/
    │   │       │       ├── pdf.mjs
    │   │       │       ├── pdf.sandbox.mjs
    │   │       │       ├── pdf.worker.entry.js
    │   │       │       ├── pdf.worker.mjs
    │   │       │       ├── cmaps/
    │   │       │       │   ├── 78-EUC-H.bcmap
    │   │       │       │   ├── 78-EUC-V.bcmap
    │   │       │       │   ├── 78-H.bcmap
    │   │       │       │   ├── 78-RKSJ-H.bcmap
    │   │       │       │   ├── 78-RKSJ-V.bcmap
    │   │       │       │   ├── 78-V.bcmap
    │   │       │       │   ├── 78ms-RKSJ-H.bcmap
    │   │       │       │   ├── 78ms-RKSJ-V.bcmap
    │   │       │       │   ├── 83pv-RKSJ-H.bcmap
    │   │       │       │   ├── 90ms-RKSJ-H.bcmap
    │   │       │       │   ├── 90ms-RKSJ-V.bcmap
    │   │       │       │   ├── 90msp-RKSJ-H.bcmap
    │   │       │       │   ├── 90msp-RKSJ-V.bcmap
    │   │       │       │   ├── 90pv-RKSJ-H.bcmap
    │   │       │       │   ├── 90pv-RKSJ-V.bcmap
    │   │       │       │   ├── Add-H.bcmap
    │   │       │       │   ├── Add-RKSJ-H.bcmap
    │   │       │       │   ├── Add-RKSJ-V.bcmap
    │   │       │       │   ├── Add-V.bcmap
    │   │       │       │   ├── Adobe-CNS1-0.bcmap
    │   │       │       │   ├── Adobe-CNS1-1.bcmap
    │   │       │       │   ├── Adobe-CNS1-2.bcmap
    │   │       │       │   ├── Adobe-CNS1-3.bcmap
    │   │       │       │   ├── Adobe-CNS1-4.bcmap
    │   │       │       │   ├── Adobe-CNS1-5.bcmap
    │   │       │       │   ├── Adobe-CNS1-6.bcmap
    │   │       │       │   ├── Adobe-CNS1-UCS2.bcmap
    │   │       │       │   ├── Adobe-GB1-0.bcmap
    │   │       │       │   ├── Adobe-GB1-1.bcmap
    │   │       │       │   ├── Adobe-GB1-2.bcmap
    │   │       │       │   ├── Adobe-GB1-3.bcmap
    │   │       │       │   ├── Adobe-GB1-4.bcmap
    │   │       │       │   ├── Adobe-GB1-5.bcmap
    │   │       │       │   ├── Adobe-GB1-UCS2.bcmap
    │   │       │       │   ├── Adobe-Japan1-0.bcmap
    │   │       │       │   ├── Adobe-Japan1-1.bcmap
    │   │       │       │   ├── Adobe-Japan1-2.bcmap
    │   │       │       │   ├── Adobe-Japan1-3.bcmap
    │   │       │       │   ├── Adobe-Japan1-4.bcmap
    │   │       │       │   ├── Adobe-Japan1-5.bcmap
    │   │       │       │   ├── Adobe-Japan1-6.bcmap
    │   │       │       │   ├── Adobe-Japan1-UCS2.bcmap
    │   │       │       │   ├── Adobe-Korea1-0.bcmap
    │   │       │       │   ├── Adobe-Korea1-1.bcmap
    │   │       │       │   ├── Adobe-Korea1-2.bcmap
    │   │       │       │   ├── Adobe-Korea1-UCS2.bcmap
    │   │       │       │   ├── B5-H.bcmap
    │   │       │       │   ├── B5-V.bcmap
    │   │       │       │   ├── B5pc-H.bcmap
    │   │       │       │   ├── B5pc-V.bcmap
    │   │       │       │   ├── CNS-EUC-H.bcmap
    │   │       │       │   ├── CNS-EUC-V.bcmap
    │   │       │       │   ├── CNS1-H.bcmap
    │   │       │       │   ├── CNS1-V.bcmap
    │   │       │       │   ├── CNS2-H.bcmap
    │   │       │       │   ├── CNS2-V.bcmap
    │   │       │       │   ├── ETen-B5-H.bcmap
    │   │       │       │   ├── ETen-B5-V.bcmap
    │   │       │       │   ├── ETenms-B5-H.bcmap
    │   │       │       │   ├── ETenms-B5-V.bcmap
    │   │       │       │   ├── ETHK-B5-H.bcmap
    │   │       │       │   ├── ETHK-B5-V.bcmap
    │   │       │       │   ├── EUC-H.bcmap
    │   │       │       │   ├── EUC-V.bcmap
    │   │       │       │   ├── Ext-H.bcmap
    │   │       │       │   ├── Ext-RKSJ-H.bcmap
    │   │       │       │   ├── Ext-RKSJ-V.bcmap
    │   │       │       │   ├── Ext-V.bcmap
    │   │       │       │   ├── GB-EUC-H.bcmap
    │   │       │       │   ├── GB-EUC-V.bcmap
    │   │       │       │   ├── GB-H.bcmap
    │   │       │       │   ├── GB-V.bcmap
    │   │       │       │   ├── GBK-EUC-H.bcmap
    │   │       │       │   ├── GBK-EUC-V.bcmap
    │   │       │       │   ├── GBK2K-H.bcmap
    │   │       │       │   ├── GBK2K-V.bcmap
    │   │       │       │   ├── GBKp-EUC-H.bcmap
    │   │       │       │   ├── GBKp-EUC-V.bcmap
    │   │       │       │   ├── GBpc-EUC-H.bcmap
    │   │       │       │   ├── GBpc-EUC-V.bcmap
    │   │       │       │   ├── GBT-EUC-H.bcmap
    │   │       │       │   ├── GBT-EUC-V.bcmap
    │   │       │       │   ├── GBT-H.bcmap
    │   │       │       │   ├── GBT-V.bcmap
    │   │       │       │   ├── GBTpc-EUC-H.bcmap
    │   │       │       │   ├── GBTpc-EUC-V.bcmap
    │   │       │       │   ├── H.bcmap
    │   │       │       │   ├── Hankaku.bcmap
    │   │       │       │   ├── Hiragana.bcmap
    │   │       │       │   ├── HKdla-B5-H.bcmap
    │   │       │       │   ├── HKdla-B5-V.bcmap
    │   │       │       │   ├── HKdlb-B5-H.bcmap
    │   │       │       │   ├── HKdlb-B5-V.bcmap
    │   │       │       │   ├── HKgccs-B5-H.bcmap
    │   │       │       │   ├── HKgccs-B5-V.bcmap
    │   │       │       │   ├── HKm314-B5-H.bcmap
    │   │       │       │   ├── HKm314-B5-V.bcmap
    │   │       │       │   ├── HKm471-B5-H.bcmap
    │   │       │       │   ├── HKm471-B5-V.bcmap
    │   │       │       │   ├── HKscs-B5-H.bcmap
    │   │       │       │   ├── HKscs-B5-V.bcmap
    │   │       │       │   ├── Katakana.bcmap
    │   │       │       │   ├── KSC-EUC-H.bcmap
    │   │       │       │   ├── KSC-EUC-V.bcmap
    │   │       │       │   ├── KSC-H.bcmap
    │   │       │       │   ├── KSC-Johab-H.bcmap
    │   │       │       │   ├── KSC-Johab-V.bcmap
    │   │       │       │   ├── KSC-V.bcmap
    │   │       │       │   ├── KSCms-UHC-H.bcmap
    │   │       │       │   ├── KSCms-UHC-HW-H.bcmap
    │   │       │       │   ├── KSCms-UHC-HW-V.bcmap
    │   │       │       │   ├── KSCms-UHC-V.bcmap
    │   │       │       │   ├── KSCpc-EUC-H.bcmap
    │   │       │       │   ├── KSCpc-EUC-V.bcmap
    │   │       │       │   ├── LICENSE
    │   │       │       │   ├── NWP-H.bcmap
    │   │       │       │   ├── NWP-V.bcmap
    │   │       │       │   ├── RKSJ-H.bcmap
    │   │       │       │   ├── RKSJ-V.bcmap
    │   │       │       │   ├── Roman.bcmap
    │   │       │       │   ├── UniCNS-UCS2-H.bcmap
    │   │       │       │   ├── UniCNS-UCS2-V.bcmap
    │   │       │       │   ├── UniCNS-UTF16-H.bcmap
    │   │       │       │   ├── UniCNS-UTF16-V.bcmap
    │   │       │       │   ├── UniCNS-UTF32-H.bcmap
    │   │       │       │   ├── UniCNS-UTF32-V.bcmap
    │   │       │       │   ├── UniCNS-UTF8-H.bcmap
    │   │       │       │   ├── UniCNS-UTF8-V.bcmap
    │   │       │       │   ├── UniGB-UCS2-H.bcmap
    │   │       │       │   ├── UniGB-UCS2-V.bcmap
    │   │       │       │   ├── UniGB-UTF16-H.bcmap
    │   │       │       │   ├── UniGB-UTF16-V.bcmap
    │   │       │       │   ├── UniGB-UTF32-H.bcmap
    │   │       │       │   ├── UniGB-UTF32-V.bcmap
    │   │       │       │   ├── UniGB-UTF8-H.bcmap
    │   │       │       │   ├── UniGB-UTF8-V.bcmap
    │   │       │       │   ├── UniJIS-UCS2-H.bcmap
    │   │       │       │   ├── UniJIS-UCS2-HW-H.bcmap
    │   │       │       │   ├── UniJIS-UCS2-HW-V.bcmap
    │   │       │       │   ├── UniJIS-UCS2-V.bcmap
    │   │       │       │   ├── UniJIS-UTF16-H.bcmap
    │   │       │       │   ├── UniJIS-UTF16-V.bcmap
    │   │       │       │   ├── UniJIS-UTF32-H.bcmap
    │   │       │       │   ├── UniJIS-UTF32-V.bcmap
    │   │       │       │   ├── UniJIS-UTF8-H.bcmap
    │   │       │       │   ├── UniJIS-UTF8-V.bcmap
    │   │       │       │   ├── UniJIS2004-UTF16-H.bcmap
    │   │       │       │   ├── UniJIS2004-UTF16-V.bcmap
    │   │       │       │   ├── UniJIS2004-UTF32-H.bcmap
    │   │       │       │   ├── UniJIS2004-UTF32-V.bcmap
    │   │       │       │   ├── UniJIS2004-UTF8-H.bcmap
    │   │       │       │   ├── UniJIS2004-UTF8-V.bcmap
    │   │       │       │   ├── UniJISPro-UCS2-HW-V.bcmap
    │   │       │       │   ├── UniJISPro-UCS2-V.bcmap
    │   │       │       │   ├── UniJISPro-UTF8-V.bcmap
    │   │       │       │   ├── UniJISX0213-UTF32-H.bcmap
    │   │       │       │   ├── UniJISX0213-UTF32-V.bcmap
    │   │       │       │   ├── UniJISX02132004-UTF32-H.bcmap
    │   │       │       │   ├── UniJISX02132004-UTF32-V.bcmap
    │   │       │       │   ├── UniKS-UCS2-H.bcmap
    │   │       │       │   ├── UniKS-UCS2-V.bcmap
    │   │       │       │   ├── UniKS-UTF16-H.bcmap
    │   │       │       │   ├── UniKS-UTF16-V.bcmap
    │   │       │       │   ├── UniKS-UTF32-H.bcmap
    │   │       │       │   ├── UniKS-UTF32-V.bcmap
    │   │       │       │   ├── UniKS-UTF8-H.bcmap
    │   │       │       │   ├── UniKS-UTF8-V.bcmap
    │   │       │       │   ├── V.bcmap
    │   │       │       │   └── WP-Symbol.bcmap
    │   │       │       ├── css/
    │   │       │       │   ├── debugger.css
    │   │       │       │   ├── viewer-redact.css
    │   │       │       │   └── viewer.css
    │   │       │       ├── example/
    │   │       │       ├── images/
    │   │       │       ├── js/
    │   │       │       │   └── viewer.mjs
    │   │       │       ├── locale/
    │   │       │       │   ├── locale.json
    │   │       │       │   ├── ach/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── af/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── an/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ar/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ast/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── az/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── be/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── bg/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── bn/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── bo/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── br/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── brx/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── bs/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ca/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── cak/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ckb/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── cs/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── cy/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── da/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── de/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── dsb/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── el/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── en-CA/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── en-GB/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── en-US/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── eo/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── es-AR/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── es-CL/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── es-ES/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── es-MX/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── et/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── eu/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── fa/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ff/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── fi/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── fr/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── fur/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── fy-NL/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ga-IE/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── gd/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── gl/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── gn/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── gu-IN/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── he/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── hi-IN/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── hr/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── hsb/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── hu/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── hy-AM/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── hye/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ia/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── id/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── is/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── it/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ja/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ka/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── kab/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── kk/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── km/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── kn/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ko/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── lij/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── lo/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── lt/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ltg/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── lv/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── meh/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── mk/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── mr/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ms/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── my/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── nb-NO/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ne-NP/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── nl/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── nn-NO/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── oc/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── pa-IN/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── pl/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── pt-BR/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── pt-PT/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── rm/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ro/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ru/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── sat/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── sc/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── scn/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── sco/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── si/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── sk/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── skr/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── sl/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── son/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── sq/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── sr/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── sv-SE/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── szl/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ta/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── te/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── tg/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── th/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── tl/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── tr/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── trs/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── uk/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── ur/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── uz/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── vi/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── wo/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── xh/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   ├── zh-CN/
    │   │       │       │   │   └── viewer.ftl
    │   │       │       │   └── zh-TW/
    │   │       │       │       └── viewer.ftl
    │   │       │       └── standard_fonts/
    │   │       │           ├── FoxitDingbats.pfb
    │   │       │           ├── FoxitFixed.pfb
    │   │       │           ├── FoxitFixedBold.pfb
    │   │       │           ├── FoxitFixedBoldItalic.pfb
    │   │       │           ├── FoxitFixedItalic.pfb
    │   │       │           ├── FoxitSerif.pfb
    │   │       │           ├── FoxitSerifBold.pfb
    │   │       │           ├── FoxitSerifBoldItalic.pfb
    │   │       │           ├── FoxitSerifItalic.pfb
    │   │       │           ├── FoxitSymbol.pfb
    │   │       │           ├── LiberationSans-Bold.ttf
    │   │       │           ├── LiberationSans-BoldItalic.ttf
    │   │       │           ├── LiberationSans-Italic.ttf
    │   │       │           ├── LiberationSans-Regular.ttf
    │   │       │           ├── LICENSE_FOXIT
    │   │       │           └── LICENSE_LIBERATION
    │   │       └── templates/
    │   │           ├── about.html
    │   │           ├── account.html
    │   │           ├── adminSettings.html
    │   │           ├── auto-split-pdf.html
    │   │           ├── change-creds.html
    │   │           ├── crop.html
    │   │           ├── database.html
    │   │           ├── error.html
    │   │           ├── extract-page.html
    │   │           ├── home-legacy.html
    │   │           ├── home.html
    │   │           ├── licenses.html
    │   │           ├── login.html
    │   │           ├── merge-pdfs.html
    │   │           ├── multi-page-layout.html
    │   │           ├── multi-tool.html
    │   │           ├── overlay-pdf.html
    │   │           ├── pdf-organizer.html
    │   │           ├── pdf-to-single-page.html
    │   │           ├── pipeline.html
    │   │           ├── releases.html
    │   │           ├── remove-image-pdf.html
    │   │           ├── remove-pages.html
    │   │           ├── rotate-pdf.html
    │   │           ├── scale-pages.html
    │   │           ├── sign.html
    │   │           ├── split-by-size-or-count.html
    │   │           ├── split-pdf-by-chapters.html
    │   │           ├── split-pdf-by-sections.html
    │   │           ├── split-pdfs.html
    │   │           ├── usage.html
    │   │           ├── view-pdf.html
    │   │           ├── convert/
    │   │           │   ├── file-to-pdf.html
    │   │           │   ├── html-to-pdf.html
    │   │           │   ├── img-to-pdf.html
    │   │           │   ├── markdown-to-pdf.html
    │   │           │   ├── pdf-to-csv.html
    │   │           │   ├── pdf-to-html.html
    │   │           │   ├── pdf-to-img.html
    │   │           │   ├── pdf-to-markdown.html
    │   │           │   ├── pdf-to-pdfa.html
    │   │           │   ├── pdf-to-presentation.html
    │   │           │   ├── pdf-to-text.html
    │   │           │   ├── pdf-to-word.html
    │   │           │   ├── pdf-to-xml.html
    │   │           │   └── url-to-pdf.html
    │   │           ├── fragments/
    │   │           │   ├── card.html
    │   │           │   ├── common.html
    │   │           │   ├── errorBanner.html
    │   │           │   ├── errorBannerPerPage.html
    │   │           │   ├── featureGroupHeader.html
    │   │           │   ├── featureGroupHeaderLegacy.html
    │   │           │   ├── footer.html
    │   │           │   ├── languageEntry.html
    │   │           │   ├── languages.html
    │   │           │   ├── multi-toolAdvert.html
    │   │           │   ├── navbar.html
    │   │           │   ├── navbarEntry.html
    │   │           │   ├── navbarEntryCustom.html
    │   │           │   └── navElements.html
    │   │           ├── misc/
    │   │           │   ├── add-image.html
    │   │           │   ├── add-page-numbers.html
    │   │           │   ├── adjust-contrast.html
    │   │           │   ├── auto-crop.html
    │   │           │   ├── auto-rename.html
    │   │           │   ├── change-metadata.html
    │   │           │   ├── compare.html
    │   │           │   ├── compress-pdf.html
    │   │           │   ├── extract-image-scans.html
    │   │           │   ├── extract-images.html
    │   │           │   ├── fake-scan.html
    │   │           │   ├── flatten.html
    │   │           │   ├── ocr-pdf.html
    │   │           │   ├── print-file.html
    │   │           │   ├── remove-annotations.html
    │   │           │   ├── remove-blanks.html
    │   │           │   ├── repair.html
    │   │           │   ├── replace-color.html
    │   │           │   ├── show-javascript.html
    │   │           │   ├── stamp.html
    │   │           │   └── unlock-pdf-forms.html
    │   │           └── security/
    │   │               ├── add-password.html
    │   │               ├── add-watermark.html
    │   │               ├── auto-redact.html
    │   │               ├── cert-sign.html
    │   │               ├── change-permissions.html
    │   │               ├── get-info-on-pdf.html
    │   │               ├── redact.html
    │   │               ├── remove-cert-sign.html
    │   │               ├── remove-password.html
    │   │               ├── remove-watermark.html
    │   │               ├── sanitize-pdf.html
    │   │               └── validate-signature.html
    │   └── test/
    │       └── java/
    │           └── stirling/
    │               └── software/
    │                   └── SPDF/
    │                       ├── SPDFApplicationTest.java
    │                       ├── config/
    │                       │   └── security/
    │                       │       ├── CustomLogoutSuccessHandlerTest.java
    │                       │       └── database/
    │                       │           └── DatabaseConfigTest.java
    │                       ├── controller/
    │                       │   └── api/
    │                       │       ├── RearrangePagesPDFControllerTest.java
    │                       │       ├── RotationControllerTest.java
    │                       │       └── converters/
    │                       │           └── ConvertWebsiteToPdfTest.java
    │                       └── utils/
    │                           ├── ErrorUtilsTest.java
    │                           ├── FileInfoTest.java
    │                           ├── FileToPdfTest.java
    │                           ├── GeneralUtilsTest.java
    │                           ├── ImageProcessingUtilsTest.java
    │                           ├── PdfUtilsTest.java
    │                           ├── ProcessExecutorTest.java
    │                           ├── PropertyConfigsTest.java
    │                           ├── RequestUriUtilsTest.java
    │                           ├── UrlUtilsTest.java
    │                           ├── WebResponseUtilsTest.java
    │                           └── validation/
    │                               └── ValidatorTest.java
    ├── testing/
    │   ├── allEndpointsRemovedSettings.yml
    │   ├── endpoints.txt
    │   ├── test.sh
    │   ├── test2.sh
    │   ├── test_disabledEndpoints.sh
    │   ├── test_webpages.sh
    │   ├── webpage_urls.txt
    │   ├── webpage_urls_full.txt
    │   ├── cucumber/
    │   │   ├── requirements.in
    │   │   ├── requirements.txt
    │   │   ├── exampleFiles/
    │   │   │   ├── example.docx
    │   │   │   ├── example.html
    │   │   │   ├── example.md
    │   │   │   ├── example.odp
    │   │   │   ├── example.odt
    │   │   │   ├── example.pptx
    │   │   │   ├── example.rtf
    │   │   │   └── example_html.zip
    │   │   └── features/
    │   │       ├── environment.py
    │   │       ├── examples.feature
    │   │       ├── external.feature
    │   │       ├── general.feature
    │   │       └── steps/
    │   │           └── step_definitions.py
    │   └── testdriver/
    │       └── test.yml
    ├── .devcontainer/
    │   ├── devcontainer.json
    │   ├── git-init.sh
    │   └── init-setup.sh
    └── .github/
        ├── CODEOWNERS
        ├── dependabot.yml
        ├── labeler-config.yml
        ├── labels.yml
        ├── pull_request_template.md
        ├── release.yml
        ├── ISSUE_TEMPLATE/
        │   ├── 1-bug.yml
        │   ├── 2-feature.yml
        │   └── config.yml
        ├── scripts/
        │   ├── check_language_properties.py
        │   ├── requirements_pre_commit.in
        │   ├── requirements_pre_commit.txt
        │   ├── requirements_sync_readme.in
        │   └── requirements_sync_readme.txt
        └── workflows/
            ├── auto-labeler.yml
            ├── build.yml
            ├── check_properties.yml
            ├── codeql.yml-disabled
            ├── dependency-review.yml
            ├── licenses-update.yml
            ├── manage-label.yml
            ├── multiOSReleases.yml
            ├── PR-Demo-cleanup.yml
            ├── PR-Demo-Comment-with-react.yml
            ├── pre_commit.yml
            ├── push-docker.yml
            ├── releaseArtifacts.yml
            ├── scorecards.yml
            ├── sonarqube.yml
            ├── stale.yml
            ├── swagger.yml
            ├── sync_files.yml
            └── testdriver.yml


Files Content:

(Files content cropped to 300k characters, download full ingest to see more)
================================================
FILE: README.md
================================================
<p align="center"><img src="https://raw.githubusercontent.com/Stirling-Tools/Stirling-PDF/main/docs/stirling.png" width="80"></p>
<h1 align="center">Stirling-PDF</h1>

[![Docker Pulls](https://img.shields.io/docker/pulls/frooodle/s-pdf)](https://hub.docker.com/r/frooodle/s-pdf)
[![Discord](https://img.shields.io/discord/1068636748814483718?label=Discord)](https://discord.gg/HYmhKj45pU)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/Stirling-Tools/Stirling-PDF/badge)](https://scorecard.dev/viewer/?uri=github.com/Stirling-Tools/Stirling-PDF)
[![GitHub Repo stars](https://img.shields.io/github/stars/stirling-tools/stirling-pdf?style=social)](https://github.com/Stirling-Tools/stirling-pdf)

<a href="https://www.producthunt.com/posts/stirling-pdf?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-stirling&#0045;pdf" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=641239&theme=light" alt="Stirling&#0032;PDF - Open&#0032;source&#0032;locally&#0032;hosted&#0032;web&#0032;PDF&#0032;editor | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/Stirling-Tools/Stirling-PDF/tree/digitalOcean&refcode=c3210994b1af)

[Stirling-PDF](https://www.stirlingpdf.com) is a robust, locally hosted web-based PDF manipulation tool using Docker. It enables you to carry out various operations on PDF files, including splitting, merging, converting, reorganizing, adding images, rotating, compressing, and more. This locally hosted web application has evolved to encompass a comprehensive set of features, addressing all your PDF requirements.

All files and PDFs exist either exclusively on the client side, reside in server memory only during task execution, or temporarily reside in a file solely for the execution of the task. Any file downloaded by the user will have been deleted from the server by that point.

Homepage: [https://stirlingpdf.com](https://stirlingpdf.com)

All documentation available at [https://docs.stirlingpdf.com/](https://docs.stirlingpdf.com/)

![stirling-home](images/stirling-home.jpg)

## Features

- 50+ PDF Operations
- Parallel file processing and downloads
- Dark mode support
- Custom download options
- Custom 'Pipelines' to run multiple features in a automated queue
- API for integration with external scripts
- Optional Login and Authentication support (see [here](https://docs.stirlingpdf.com/Advanced%20Configuration/System%20and%20Security) for documentation)
- Database Backup and Import (see [here](https://docs.stirlingpdf.com/Advanced%20Configuration/DATABASE) for documentation)
- Enterprise features like SSO see [here](https://docs.stirlingpdf.com/Enterprise%20Edition)

## PDF Features

### Page Operations

- View and modify PDFs - View multi-page PDFs with custom viewing, sorting, and searching. Plus, on-page edit features like annotating, drawing, and adding text and images. (Using PDF.js with Joxit and Liberation fonts)
- Full interactive GUI for merging/splitting/rotating/moving PDFs and their pages
- Merge multiple PDFs into a single resultant file
- Split PDFs into multiple files at specified page numbers or extract all pages as individual files
- Reorganize PDF pages into different orders
- Rotate PDFs in 90-degree increments
- Remove pages
- Multi-page layout (format PDFs into a multi-paged page)
- Scale page contents size by set percentage
- Adjust contrast
- Crop PDF
- Auto-split PDF (with physically scanned page dividers)
- Extract page(s)
- Convert PDF to a single page
- Overlay PDFs on top of each other
- PDF to a single page
- Split PDF by sections

### Conversion Operations

- Convert PDFs to and from images
- Convert any common file to PDF (using LibreOffice)
- Convert PDF to Word/PowerPoint/others (using LibreOffice)
- Convert HTML to PDF
- Convert PDF to XML
- Convert PDF to CSV
- URL to PDF
- Markdown to PDF

### Security & Permissions

- Add and remove passwords
- Change/set PDF permissions
- Add watermark(s)
- Certify/sign PDFs
- Sanitize PDFs
- Auto-redact text

### Other Operations

- Add/generate/write signatures
- Split by Size or PDF
- Repair PDFs
- Detect and remove blank pages
- Compare two PDFs and show differences in text
- Add images to PDFs
- Compress PDFs to decrease their filesize (using qpdf)
- Extract images from PDF
- Remove images from PDF
- Extract images from scans
- Remove annotations
- Add page numbers
- Auto-rename files by detecting PDF header text
- OCR on PDF (using Tesseract OCR)
- PDF/A conversion (using LibreOffice)
- Edit metadata
- Flatten PDFs
- Get all information on a PDF to view or export as JSON
- Show/detect embedded JavaScript




# 📖 Get Started

Visit our comprehensive documentation at [docs.stirlingpdf.com](https://docs.stirlingpdf.com) for:

- Installation guides for all platforms
- Configuration options
- Feature documentation
- API reference
- Security setup
- Enterprise features


## Supported Languages

Stirling-PDF currently supports 39 languages!

| Language                                     | Progress                               |
| -------------------------------------------- | -------------------------------------- |
| Arabic (العربية) (ar_AR)                        | ![83%](https://geps.dev/progress/83)   |
| Azerbaijani (Azərbaycan Dili) (az_AZ)        | ![82%](https://geps.dev/progress/82)   |
| Basque (Euskara) (eu_ES)                     | ![48%](https://geps.dev/progress/48)   |
| Bulgarian (Български) (bg_BG)                | ![92%](https://geps.dev/progress/92)   |
| Catalan (Català) (ca_CA)                     | ![89%](https://geps.dev/progress/89)   |
| Croatian (Hrvatski) (hr_HR)                  | ![81%](https://geps.dev/progress/81)   |
| Czech (Česky) (cs_CZ)                        | ![91%](https://geps.dev/progress/91)   |
| Danish (Dansk) (da_DK)                       | ![80%](https://geps.dev/progress/80)   |
| Dutch (Nederlands) (nl_NL)                   | ![79%](https://geps.dev/progress/79)   |
| English (English) (en_GB)                    | ![100%](https://geps.dev/progress/100) |
| English (US) (en_US)                         | ![100%](https://geps.dev/progress/100) |
| French (Français) (fr_FR)                    | ![91%](https://geps.dev/progress/91)   |
| German (Deutsch) (de_DE)                     | ![99%](https://geps.dev/progress/99)   |
| Greek (Ελληνικά) (el_GR)                     | ![91%](https://geps.dev/progress/91)   |
| Hindi (हिंदी) (hi_IN)                          | ![91%](https://geps.dev/progress/91)   |
| Hungarian (Magyar) (hu_HU)                   | ![99%](https://geps.dev/progress/99)   |
| Indonesian (Bahasa Indonesia) (id_ID)        | ![80%](https://geps.dev/progress/80)   |
| Irish (Gaeilge) (ga_IE)                      | ![91%](https://geps.dev/progress/91)   |
| Italian (Italiano) (it_IT)                   | ![99%](https://geps.dev/progress/99)   |
| Japanese (日本語) (ja_JP)                    | ![93%](https://geps.dev/progress/93)   |
| Korean (한국어) (ko_KR)                      | ![92%](https://geps.dev/progress/92)   |
| Norwegian (Norsk) (no_NB)                    | ![86%](https://geps.dev/progress/86)   |
| Persian (فارسی) (fa_IR)                      | ![87%](https://geps.dev/progress/87)   |
| Polish (Polski) (pl_PL)                      | ![95%](https://geps.dev/progress/95)   |
| Portuguese (Português) (pt_PT)               | ![91%](https://geps.dev/progress/91)   |
| Portuguese Brazilian (Português) (pt_BR)     | ![97%](https://geps.dev/progress/97)   |
| Romanian (Română) (ro_RO)                    | ![75%](https://geps.dev/progress/75)   |
| Russian (Русский) (ru_RU)                    | ![93%](https://geps.dev/progress/93)   |
| Serbian Latin alphabet (Srpski) (sr_LATN_RS) | ![60%](https://geps.dev/progress/60)   |
| Simplified Chinese (简体中文) (zh_CN)         | ![93%](https://geps.dev/progress/93)   |
| Slovakian (Slovensky) (sk_SK)                | ![69%](https://geps.dev/progress/69)   |
| Slovenian (Slovenščina) (sl_SI)              | ![94%](https://geps.dev/progress/94)   |
| Spanish (Español) (es_ES)                    | ![98%](https://geps.dev/progress/98)   |
| Swedish (Svenska) (sv_SE)                    | ![87%](https://geps.dev/progress/87)   |
| Thai (ไทย) (th_TH)                           | ![80%](https://geps.dev/progress/80)   |
| Tibetan (བོད་ཡིག་) (zh_BO)                     | ![88%](https://geps.dev/progress/88) |
| Traditional Chinese (繁體中文) (zh_TW)        | ![99%](https://geps.dev/progress/99)   |
| Turkish (Türkçe) (tr_TR)                     | ![97%](https://geps.dev/progress/97)   |
| Ukrainian (Українська) (uk_UA)               | ![96%](https://geps.dev/progress/96)   |
| Vietnamese (Tiếng Việt) (vi_VN)              | ![73%](https://geps.dev/progress/73)   |


## Stirling PDF Enterprise

Stirling PDF offers an Enterprise edition of its software. This is the same great software but with added features, support and comforts.
Check out our [Enterprise docs](https://docs.stirlingpdf.com/Enterprise%20Edition)


## 🤝 Looking to contribute?

Join our community:
- [Contribution Guidelines](CONTRIBUTING.md)
- [Translation Guide (How to add custom languages)](HowToAddNewLanguage.md)
- [Issue Tracker](https://github.com/Stirling-Tools/Stirling-PDF/issues)
- [Discord Community](https://discord.gg/HYmhKj45pU)
- [Developer Guide](DeveloperGuide.md)



================================================
FILE: allowed-licenses.json
================================================
{
  "allowedLicenses": [
    {
      "moduleName": ".*",
      "moduleLicense": "BSD License"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "The BSD License"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "BSD-2-Clause"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "BSD 2-Clause License"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "The 2-Clause BSD License"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "BSD-3-Clause"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "The BSD 3-Clause License (BSD3)"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "BSD-4 License"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "MIT"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "MIT License"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "The MIT License"
    },
    {
      "moduleName": "com.github.jai-imageio:jai-imageio-core",
      "moduleLicense": "LICENSE.txt"
    },
    {
      "moduleName": "com.github.jai-imageio:jai-imageio-jpeg2000",
      "moduleLicense": "LICENSE-JJ2000.txt, LICENSE-Sun.txt"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Apache 2"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Apache 2.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Apache-2.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Apache-2.0 License"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Apache License 2.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Apache License Version 2.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Apache License, Version 2.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "The Apache License, Version 2.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "The Apache Software License, Version 2.0"
    },
    {
      "moduleName": "com.nimbusds:oauth2-oidc-sdk",
      "moduleLicense": "\"Apache License, version 2.0\";link=\"https://www.apache.org/licenses/LICENSE-2.0.html\""
    },
    {
      "moduleName": ".*",
      "moduleLicense": "MPL 2.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "UnboundID SCIM2 SDK Free Use License"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "GPL2 w/ CPE"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "GPLv2+CE"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "GNU GENERAL PUBLIC LICENSE, Version 2 + Classpath Exception"
    },
    {
      "moduleName": "com.martiansoftware:jsap",
      "moduleLicense": "LGPL"
    },
    {
      "moduleName": "org.hibernate.orm:hibernate-core",
      "moduleLicense": "GNU Library General Public License v2.1 or later"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "COMMON DEVELOPMENT AND DISTRIBUTION LICENSE (CDDL) Version 1.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Eclipse Public License - v 1.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Eclipse Public License v. 2.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Eclipse Public License - v 2.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Eclipse Public License - Version 2.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Eclipse Public License, Version 2.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Ubuntu Font Licence 1.0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Bouncy Castle Licence"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "Public Domain, per Creative Commons CC0"
    },
    {
      "moduleName": ".*",
      "moduleLicense": "The W3C License"
    }
  ]
}



================================================
FILE: CONTRIBUTING.md
================================================
# Contributing to Stirling-PDF

Thank you for your interest in contributing to Stirling-PDF! There are many ways to contribute other than writing code. For example, reporting bugs, creating suggestions, and adding or modifying translations.

## Issue Guidelines

Issues can be used to report bugs, request features, or ask questions. If you have a question, you could also ask us in our [Discord](https://discord.gg/FJUSXUSYec).

Before opening an issue, please check to make sure someone hasn't already opened an issue about it.

## Pull Requests

Before you start working on an issue, please comment on (or create) the issue and wait for it to be assigned to you. If someone has already been assigned but didn't have the time to work on it lately, please communicate with them and ask if they're still working on it. This is to avoid multiple people working on the same issue.

Once you have been assigned an issue, you can start working on it. When you are ready to submit your changes, open a pull request.
For a detailed pull request tutorial, see [this guide](https://www.digitalocean.com/community/tutorials/how-to-create-a-pull-request-on-github).

Please make sure your Pull Request adheres to the following guidelines:

- Use the PR template provided.
- Keep your Pull Request title succinct, detailed, and to the point.
- Keep commits atomic. One commit should contain one change. If you want to make multiple changes, submit multiple Pull Requests.
- Commits should be clear, concise, and easy to understand.
- References to the Issue number in the Pull Request and/or Commit message.

## Translations

If you would like to add or modify a translation, please see [How to add new languages to Stirling-PDF](HowToAddNewLanguage.md). Also, please create a Pull Request so others can use it!

## Docs

Documentation for Stirling-PDF is handled in a separate repository. Please see [Docs repository](https://github.com/Stirling-Tools/Stirling-Tools.github.io) or use the "edit this page"-button at the bottom of each page at [https://docs.stirlingpdf.com/](https://docs.stirlingpdf.com/).

## Fixing Bugs or Adding a New Feature

First, make sure you've read the section [Pull Requests](#pull-requests).

If, at any point in time, you have a question, please feel free to ask in the same issue thread or in our [Discord](https://discord.gg/FJUSXUSYec).

Developers should review our [Developer Guide](DeveloperGuide.md)

## License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).



================================================
FILE: DATABASE.md
================================================
# New Database Backup and Import Functionality

## Functionality Overview

The newly introduced feature enhances the application with robust database backup and import capabilities. This feature is designed to ensure data integrity and provide a straightforward way to manage database backups. Here's how it works:

1. Automatic Backup Creation
   - The system automatically creates a database backup every day at midnight. This ensures that there is always a recent backup available, minimizing the risk of data loss.
2. Manual Backup Export
   - Admin actions that modify the user database trigger a manual export of the database. This keeps the backup up-to-date with the latest changes and provides an extra layer of data security.
3. Importing Database Backups
   - Admin users can import a database backup either via the web interface or API endpoints. This allows for easy restoration of the database to a previous state in case of data corruption or other issues.
   - The import process ensures that the database structure and data are correctly restored, maintaining the integrity of the application.
4. Managing Backup Files
   - Admins can view a list of all existing backup files, along with their creation dates and sizes. This helps in managing storage and identifying the most recent or relevant backups.
   - Backup files can be downloaded for offline storage or transferred to other environments, providing flexibility in database management.
   - Unnecessary backup files can be deleted through the interface to free up storage space and maintain an organized backup directory.

## User Interface

### Web Interface

1. Upload SQL files to import database backups.
2. View details of existing backups, such as file names, creation dates, and sizes.
3. Download backup files for offline storage.
4. Delete outdated or unnecessary backup files.

### API Endpoints

1. Import database backups by uploading SQL files.
2. Download backup files.
3. Delete backup files.

This new functionality streamlines database management, ensuring that backups are always available and easy to manage, thus improving the reliability and resilience of the application.



================================================
FILE: DeveloperGuide.md
================================================
# Stirling-PDF Developer Guide

## 1. Introduction

Stirling-PDF is a robust, locally hosted, web-based PDF manipulation tool. This guide focuses on Docker-based development and testing, which is the recommended approach for working with the full version of Stirling-PDF.

## 2. Project Overview

Stirling-PDF is built using:

- Spring Boot + Thymeleaf
- PDFBox
- LibreOffice
- qpdf
- HTML, CSS, JavaScript
- Docker
- PDF.js
- PDF-LIB.js
- Lombok

## 3. Development Environment Setup

### Prerequisites

- Docker
- Git
- Java JDK 17 or later
- Gradle 7.0 or later (Included within the repo)

### Setup Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Stirling-Tools/Stirling-PDF.git
   cd Stirling-PDF
   ```

2. Install Docker and JDK17 if not already installed.

3. Install a recommended Java IDE such as Eclipse, IntelliJ, or VSCode
   1. Only VSCode
      1. Open VS Code.
      2. When prompted, install the recommended extensions.
      3. Alternatively, open the command palette (`Ctrl + Shift + P` or `Cmd + Shift + P` on macOS) and run:

        ```sh
        Extensions: Show Recommended Extensions
        ```

      4. Install the required extensions from the list.

4. Lombok Setup
Stirling-PDF uses Lombok to reduce boilerplate code. Some IDEs, like Eclipse, don't support Lombok out of the box. To set up Lombok in your development environment:
Visit the [Lombok website](https://projectlombok.org/setup/) for installation instructions specific to your IDE.

5. Add environment variable
For local testing, you should generally be testing the full 'Security' version of Stirling-PDF. To do this, you must add the environment flag DOCKER_ENABLE_SECURITY=true to your system and/or IDE build/run step.

## 4. Project Structure

```bash
Stirling-PDF/
├── .github/               # GitHub-specific files (workflows, issue templates)
├── configs/               # Configuration files used by stirling at runtime (generated at runtime)
├── cucumber/              # Cucumber test files
│   ├── features/
├── customFiles/           # Custom static files and templates (generated at runtime used to replace existing files)
├── docs/                  # Documentation files
├── exampleYmlFiles/       # Example YAML configuration files
├── images/                # Image assets
├── pipeline/              # Pipeline-related files (generated at runtime)
├── scripts/               # Utility scripts
├── src/                   # Source code
│   ├── main/
│   │   ├── java/
│   │   │   └── stirling/
│   │   │       └── software/
│   │   │           └── SPDF/
│   │   │               ├── config/
│   │   │               ├── controller/
│   │   │               ├── model/
│   │   │               ├── repository/
│   │   │               ├── service/
│   │   │               └── utils/
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/
│   │       │   ├── js/
│   │       │   └── pdfjs/
│   │       └── templates/
│   └── test/
│       └── java/
│           └── stirling/
│               └── software/
│                   └── SPDF/
├── build.gradle           # Gradle build configuration
├── Dockerfile             # Main Dockerfile
├── Dockerfile.ultra-lite  # Dockerfile for ultra-lite version
├── Dockerfile.fat         # Dockerfile for fat version
├── docker-compose.yml     # Docker Compose configuration
└── test.sh                # Test script to deploy all docker versions and run cuke tests
```

## 5. Docker-based Development

Stirling-PDF offers several Docker versions:

- Full: All features included
- Ultra-Lite: Basic PDF operations only
- Fat: Includes additional libraries and fonts predownloaded

### Example Docker Compose Files

Stirling-PDF provides several example Docker Compose files in the `exampleYmlFiles` directory, such as:

- `docker-compose-latest.yml`: Latest version without security features
- `docker-compose-latest-security.yml`: Latest version with security features enabled
- `docker-compose-latest-fat-security.yml`: Fat version with security features enabled

These files provide pre-configured setups for different scenarios. For example, here's a snippet from `docker-compose-latest-security.yml`:

```yaml
services:
  stirling-pdf:
    container_name: Stirling-PDF-Security
    image: docker.stirlingpdf.com/stirlingtools/stirling-pdf:latest
    deploy:
      resources:
        limits:
          memory: 4G
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/api/v1/info/status | grep -q 'UP' && curl -fL http://localhost:8080/ | grep -q 'Please sign in'"]
      interval: 5s
      timeout: 10s
      retries: 16
    ports:
      - "8080:8080"
    volumes:
      - /stirling/latest/data:/usr/share/tessdata:rw
      - /stirling/latest/config:/configs:rw
      - /stirling/latest/logs:/logs:rw
    environment:
      DOCKER_ENABLE_SECURITY: "true"
      SECURITY_ENABLELOGIN: "true"
      PUID: 1002
      PGID: 1002
      UMASK: "022"
      SYSTEM_DEFAULTLOCALE: en-US
      UI_APPNAME: Stirling-PDF
      UI_HOMEDESCRIPTION: Demo site for Stirling-PDF Latest with Security
      UI_APPNAMENAVBAR: Stirling-PDF Latest
      SYSTEM_MAXFILESIZE: "100"
      METRICS_ENABLED: "true"
      SYSTEM_GOOGLEVISIBILITY: "true"
      SHOW_SURVEY: "true"
    restart: on-failure:5
```

To use these example files, copy the desired file to your project root and rename it to `docker-compose.yml`, or specify the file explicitly when running Docker Compose:

```bash
docker-compose -f exampleYmlFiles/docker-compose-latest-security.yml up
```

### Building Docker Images

Stirling-PDF uses different Docker images for various configurations. The build process is controlled by environment variables and uses specific Dockerfile variants. Here's how to build the Docker images:

1. Set the security environment variable:

   ```bash
   export DOCKER_ENABLE_SECURITY=false  # or true for security-enabled builds
   ```

2. Build the project with Gradle:

   ```bash
   ./gradlew clean build
   ```

3. Build the Docker images:

   For the latest version:

   ```bash
   docker build --no-cache --pull --build-arg VERSION_TAG=alpha -t stirlingtools/stirling-pdf:latest -f ./Dockerfile .
   ```

   For the ultra-lite version:

   ```bash
   docker build --no-cache --pull --build-arg VERSION_TAG=alpha -t stirlingtools/stirling-pdf:latest-ultra-lite -f ./Dockerfile.ultra-lite .
   ```

   For the fat version (with security enabled):

   ```bash
   export DOCKER_ENABLE_SECURITY=true
   docker build --no-cache --pull --build-arg VERSION_TAG=alpha -t stirlingtools/stirling-pdf:latest-fat -f ./Dockerfile.fat .
   ```

Note: The `--no-cache` and `--pull` flags ensure that the build process uses the latest base images and doesn't use cached layers, which is useful for testing and ensuring reproducible builds. however to improve build times these can often be removed depending on your usecase

## 6. Testing

### Comprehensive Testing Script

Stirling-PDF provides a `test.sh` script in the root directory. This script builds all versions of Stirling-PDF, checks that each version works, and runs Cucumber tests. It's recommended to run this script before submitting a final pull request.

To run the test script:

```bash
./test.sh
```

This script performs the following actions:

1. Builds all Docker images (full, ultra-lite, fat).
2. Runs each version to ensure it starts correctly.
3. Executes Cucumber tests against the main version and ensures feature compatibility. In the event these tests fail, your PR will not be merged.

Note: The `test.sh` script will run automatically when you raise a PR. However, it's recommended to run it locally first to save resources and catch any issues early.

### Full Testing with Docker

1. Build and run the Docker container per the above instructions:

2. Access the application at `http://localhost:8080` and manually test all features developed.

### Local Testing (Java and UI Components)

For quick iterations and development of Java backend, JavaScript, and UI components, you can run and test Stirling-PDF locally without Docker. This approach allows you to work on and verify changes to:

- Java backend logic
- RESTful API endpoints
- JavaScript functionality
- User interface components and styling
- Thymeleaf templates

To run Stirling-PDF locally:

1. Compile and run the project using built-in IDE methods or by running:

   ```bash
   ./gradlew bootRun
   ```

2. Access the application at `http://localhost:8080` in your web browser.

3. Manually test the features you're working on through the UI.

4. For API changes, use tools like Postman or curl to test endpoints directly.

Important notes:

- Local testing doesn't include features that depend on external tools like qpdf, LibreOffice, or Python scripts.
- There are currently no automated unit tests. All testing is done manually through the UI or API calls. (You are welcome to add JUnits!)
- Always verify your changes in the full Docker environment before submitting pull requests, as some integrations and features will only work in the complete setup.

## 7. Contributing

1. Fork the repository on GitHub.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear, descriptive messages and ensure any documentation is updated related to your changes.
4. Test your changes thoroughly in the Docker environment.
5. Run the `test.sh` script to ensure all versions build correctly and pass the Cucumber tests:

   ```bash
   ./test.sh
   ```

6. Push your changes to your fork.
7. Submit a pull request to the main repository.
8. See additional [contributing guidelines](https://github.com/Stirling-Tools/Stirling-PDF/blob/main/CONTRIBUTING.md).

When you raise a PR:

- The `test.sh` script will run automatically against your PR.
- The PR checks will verify versioning and dependency updates.
- Documentation will be automatically updated for dependency changes.
- Security issues will be checked using Snyk and PixeeBot.

Address any issues that arise from these checks before finalizing your pull request.

## 8. API Documentation

API documentation is available at `/swagger-ui/index.html` when running the application. You can also view the latest API documentation [here](https://app.swaggerhub.com/apis-docs/Stirling-Tools/Stirling-PDF/).

## 9. Customization

Stirling-PDF can be customized through environment variables or a `settings.yml` file. Key customization options include:

- Application name and branding
- Security settings
- UI customization
- Endpoint management

When using Docker, pass environment variables using the `-e` flag or in your `docker-compose.yml` file.

Example:

```bash
docker run -p 8080:8080 -e APP_NAME="My PDF Tool" stirling-pdf:full
```

Refer to the main README for a full list of customization options.

## 10. Language Translations

For managing language translations that affect multiple files, Stirling-PDF provides a helper script:

```bash
/scripts/replace_translation_line.sh
```

This script helps you make consistent replacements across language files.

When contributing translations:

1. Use the helper script for multi-file changes.
2. Ensure all language files are updated consistently.
3. The PR checks will verify consistency in language file updates.

Remember to test your changes thoroughly to ensure they don't break any existing functionality.

## Code examples

### Overview of Thymeleaf

Thymeleaf is a server-side Java HTML template engine. It is used in Stirling-PDF to render dynamic web pages. Thymeleaf integrates heavily with Spring Boot.

### Thymeleaf overview

In Stirling-PDF, Thymeleaf is used to create HTML templates that are rendered on the server side. These templates are located in the `src/main/resources/templates` directory. Thymeleaf templates use a combination of HTML and special Thymeleaf attributes to dynamically generate content.

Some examples of this are:

```html
<th:block th:insert="~{fragments/navbar.html :: navbar}"></th:block>
```
or
```html
<th:block th:insert="~{fragments/footer.html :: footer}"></th:block>
```

Where it uses the `th:block`, `th:` indicating it's a special Thymeleaf element to be used server-side in generating the HTML, and block being the actual element type.
In this case, we are inserting the `navbar` entry within the `fragments/navbar.html` fragment into the `th:block` element.

They can be more complex, such as:

```html
<th:block th:insert="~{fragments/common :: head(title=#{pageExtracter.title}, header=#{pageExtracter.header})}"></th:block>
```

Which is the same as above but passes the parameters title and header into the fragment `common.html` to be used in its HTML generation.

Thymeleaf can also be used to loop through objects or pass things from the Java side into the HTML side.

```java
 @GetMapping
       public String newFeaturePage(Model model) {
           model.addAttribute("exampleData", exampleData);
           return "new-feature";
       }
```

In the above example, if exampleData is a list of plain java objects of class Person and within it, you had id, name, age, etc. You can reference it like so

```html
<tbody>
   <!-- Use th:each to iterate over the list -->
   <tr th:each="person : ${exampleData}">
       <td th:text="${person.id}"></td>
       <td th:text="${person.name}"></td>
       <td th:text="${person.age}"></td>
       <td th:text="${person.email}"></td>
   </tr>
</tbody>
```

This would generate n entries of tr for each person in exampleData

### Adding a New Feature to the Backend (API)

1. **Create a New Controller:**
   - Create a new Java class in the `src/main/java/stirling/software/SPDF/controller/api` directory.
   - Annotate the class with `@RestController` and `@RequestMapping` to define the API endpoint.
   - Ensure to add API documentation annotations like `@Tag(name = "General", description = "General APIs")` and `@Operation(summary = "Crops a PDF document", description = "This operation takes an input PDF file and crops it according to the given coordinates. Input:PDF Output:PDF Type:SISO")`.

   ```java
   package stirling.software.SPDF.controller.api;

   import org.springframework.web.bind.annotation.GetMapping;
   import org.springframework.web.bind.annotation.RequestMapping;
   import org.springframework.web.bind.annotation.RestController;
   import io.swagger.v3.oas.annotations.Operation;
   import io.swagger.v3.oas.annotations.tags.Tag;

   @RestController
   @RequestMapping("/api/v1/new-feature")
   @Tag(name = "General", description = "General APIs")
   public class NewFeatureController {

       @GetMapping
       @Operation(summary = "New Feature", description = "This is a new feature endpoint.")
       public String newFeature() {
           return "NewFeatureResponse"; // This refers to the NewFeatureResponse.html template presenting the user with the generated html from that file when they navigate to /api/v1/new-feature
       }
   }
   ```

2. **Define the Service Layer:** (Not required but often useful)
   - Create a new service class in the `src/main/java/stirling/software/SPDF/service` directory.
   - Implement the business logic for the new feature.

   ```java
   package stirling.software.SPDF.service;

   import org.springframework.stereotype.Service;

   @Service
   public class NewFeatureService {

       public String getNewFeatureData() {
           // Implement business logic here
           return "New Feature Data";
       }
   }
   ```

2b. **Integrate the Service with the Controller:**

- Autowire the service class in the controller and use it to handle the API request.

  ```java
  package stirling.software.SPDF.controller.api;

  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.web.bind.annotation.GetMapping;
  import org.springframework.web.bind.annotation.RequestMapping;
  import org.springframework.web.bind.annotation.RestController;
  import stirling.software.SPDF.service.NewFeatureService;
  import io.swagger.v3.oas.annotations.Operation;
  import io.swagger.v3.oas.annotations.tags.Tag;

  @RestController
  @RequestMapping("/api/v1/new-feature")
  @Tag(name = "General", description = "General APIs")
  public class NewFeatureController {

      @Autowired
      private NewFeatureService newFeatureService;

      @GetMapping
      @Operation(summary = "New Feature", description = "This is a new feature endpoint.")
      public String newFeature() {
          return newFeatureService.getNewFeatureData();
      }
  }
  ```

### Adding a New Feature to the Frontend (UI)

1. **Create a New Thymeleaf Template:**
   - Create a new HTML file in the `src/main/resources/templates` directory.
   - Use Thymeleaf attributes to dynamically generate content.
   - Use `extract-page.html` as a base example for the HTML template, which is useful to ensure importing of the general layout, navbar, and footer.

   ```html
   <!DOCTYPE html>
   <html th:lang="${#locale.language}" th:dir="#{language.direction}" th:data-language="${#locale.toString()}" xmlns:th="https://www.thymeleaf.org">
     <head>
     <th:block th:insert="~{fragments/common :: head(title=#{newFeature.title}, header=#{newFeature.header})}"></th:block>
     </head>

     <body>
       <div id="page-container">
         <div id="content-wrap">
           <th:block th:insert="~{fragments/navbar.html :: navbar}"></th:block>
           <br><br>
           <div class="container">
             <div class="row justify-content-center">
               <div class="col-md-6 bg-card">
                 <div class="tool-header">
                   <span class="material-symbols-rounded tool-header-icon organize">upload</span>
                   <span class="tool-header-text" th:text="#{newFeature.header}"></span>
                 </div>
                 <form th:action="@{'/api/v1/new-feature'}" method="post" enctype="multipart/form-data">
                   <div th:replace="~{fragments/common :: fileSelector(name='fileInput', multipleInputsForSingleRequest=false, accept='application/pdf')}"></div>
                   <input type="hidden" id="customMode" name="customMode" value="">
                   <div class="mb-3">
                     <label for="featureInput" th:text="#{newFeature.prompt}"></label>
                     <input type="text" class="form-control" id="featureInput" name="featureInput" th:placeholder="#{newFeature.placeholder}" required>
                   </div>

                   <button type="submit" id="submitBtn" class="btn btn-primary" th:text="#{newFeature.submit}"></button>
                 </form>
               </div>
             </div>
           </div>
         </div>
         <th:block th:insert="~{fragments/footer.html :: footer}"></th:block>
       </div>
     </body>
   </html>
   ```

2. **Create a New Controller for the UI:**
   - Create a new Java class in the `src/main/java/stirling/software/SPDF/controller/ui` directory.
   - Annotate the class with `@Controller` and `@RequestMapping` to define the UI endpoint.

   ```java
   package stirling.software.SPDF.controller.ui;

   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.stereotype.Controller;
   import org.springframework.ui.Model;
   import org.springframework.web.bind.annotation.GetMapping;
   import org.springframework.web.bind.annotation.RequestMapping;
   import stirling.software.SPDF.service.NewFeatureService;

   @Controller
   @RequestMapping("/new-feature")
   public class NewFeatureUIController {

       @Autowired
       private NewFeatureService newFeatureService;

       @GetMapping
       public String newFeaturePage(Model model) {
           model.addAttribute("newFeatureData", newFeatureService.getNewFeatureData());
           return "new-feature";
       }
   }
   ```

3. **Update the Navigation Bar:**
   - Add a link to the new feature page in the navigation bar.
   - Update the `src/main/resources/templates/fragments/navbar.html` file.

   ```html
   <li class="nav-item">
       <a class="nav-link" th:href="@{/new-feature}">New Feature</a>
   </li>
   ```

## Adding New Translations to Existing Language Files in Stirling-PDF

When adding a new feature or modifying existing ones in Stirling-PDF, you'll need to add new translation entries to the existing language files. Here's a step-by-step guide:

### 1. Locate Existing Language Files

Find the existing `messages.properties` files in the `src/main/resources` directory. You'll see files like:

- `messages.properties` (default, usually English)
- `messages_en_GB.properties`
- `messages_fr_FR.properties`
- `messages_de_DE.properties`
- etc.

### 2. Add New Translation Entries

Open each of these files and add your new translation entries. For example, if you're adding a new feature called "PDF Splitter",
Use descriptive, hierarchical keys (e.g., `feature.element.description`)
you might add:

```properties
pdfSplitter.title=PDF Splitter
pdfSplitter.description=Split your PDF into multiple documents
pdfSplitter.button.split=Split PDF
pdfSplitter.input.pages=Enter page numbers to split
```

Add these entries to the default GB language file and any others you wish, translating the values as appropriate for each language.

### 3. Use Translations in Thymeleaf Templates

In your Thymeleaf templates, use the `#{key}` syntax to reference the new translations:

```html
<h1 th:text="#{pdfSplitter.title}">PDF Splitter</h1>
<p th:text="#{pdfSplitter.description}">Split your PDF into multiple documents</p>
<input type="text" th:placeholder="#{pdfSplitter.input.pages}">
<button th:text="#{pdfSplitter.button.split}">Split PDF</button>
```

Remember, never hard-code text in your templates or Java code. Always use translation keys to ensure proper localization.



================================================
FILE: Dockerfile
================================================
# Main stage
FROM alpine:3.21.3@sha256:a8560b36e8b8210634f77d9f7f9efd7ffa463e380b75e2e74aff4511df3ef88c

# Copy necessary files
COPY scripts /scripts
COPY pipeline /pipeline
COPY src/main/resources/static/fonts/*.ttf /usr/share/fonts/opentype/noto/
#COPY src/main/resources/static/fonts/*.otf /usr/share/fonts/opentype/noto/
COPY build/libs/*.jar app.jar

ARG VERSION_TAG

LABEL org.opencontainers.image.title="Stirling-PDF"
LABEL org.opencontainers.image.description="A powerful locally hosted web-based PDF manipulation tool supporting 50+ operations including merging, splitting, conversion, OCR, watermarking, and more."
LABEL org.opencontainers.image.source="https://github.com/Stirling-Tools/Stirling-PDF"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.vendor="Stirling-Tools"
LABEL org.opencontainers.image.url="https://www.stirlingpdf.com"
LABEL org.opencontainers.image.documentation="https://docs.stirlingpdf.com"
LABEL maintainer="Stirling-Tools"
LABEL org.opencontainers.image.authors="Stirling-Tools"
LABEL org.opencontainers.image.version="${VERSION_TAG}"
LABEL org.opencontainers.image.keywords="PDF, manipulation, merge, split, convert, OCR, watermark"

# Set Environment Variables
ENV DOCKER_ENABLE_SECURITY=false \
    VERSION_TAG=$VERSION_TAG \
    JAVA_BASE_OPTS="-XX:+UnlockExperimentalVMOptions -XX:MaxRAMPercentage=75 -XX:InitiatingHeapOccupancyPercent=20 -XX:+G1PeriodicGCInvokesConcurrent -XX:G1PeriodicGCInterval=10000 -XX:+UseStringDeduplication -XX:G1PeriodicGCSystemLoadThreshold=70" \
    JAVA_CUSTOM_OPTS="" \
    HOME=/home/stirlingpdfuser \
    PUID=1000 \
    PGID=1000 \
    UMASK=022 \
    PYTHONPATH=/usr/lib/libreoffice/program:/opt/venv/lib/python3.12/site-packages \
    UNO_PATH=/usr/lib/libreoffice/program \
    URE_BOOTSTRAP=file:///usr/lib/libreoffice/program/fundamentalrc \
    PATH=$PATH:/opt/venv/bin


# JDK for app
RUN echo "@main https://dl-cdn.alpinelinux.org/alpine/edge/main" | tee -a /etc/apk/repositories && \
    echo "@community https://dl-cdn.alpinelinux.org/alpine/edge/community" | tee -a /etc/apk/repositories && \
    echo "@testing https://dl-cdn.alpinelinux.org/alpine/edge/testing" | tee -a /etc/apk/repositories && \
    apk upgrade --no-cache -a && \
    apk add --no-cache \
    ca-certificates \
    tzdata \
    tini \
    bash \
    curl \
    qpdf \
    shadow \
    su-exec \
    openssl \
    openssl-dev \
    openjdk21-jre \
    # Doc conversion
    gcompat \
    libc6-compat \
    libreoffice \
    # pdftohtml
    poppler-utils \
    # OCR MY PDF (unpaper for descew and other advanced features)
    tesseract-ocr-data-eng \
    tesseract-ocr-data-chi_sim \
	tesseract-ocr-data-deu \
	tesseract-ocr-data-fra \
	tesseract-ocr-data-por \
    # CV
    py3-opencv \
    python3 \
    py3-pip \
    py3-pillow@testing \
    py3-pdf2image@testing && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade unoserver weasyprint && \
    ln -s /usr/lib/libreoffice/program/uno.py /opt/venv/lib/python3.12/site-packages/ && \
    ln -s /usr/lib/libreoffice/program/unohelper.py /opt/venv/lib/python3.12/site-packages/ && \
    ln -s /usr/lib/libreoffice/program /opt/venv/lib/python3.12/site-packages/LibreOffice && \
    mv /usr/share/tessdata /usr/share/tessdata-original && \
    mkdir -p $HOME /configs /logs /customFiles /pipeline/watchedFolders /pipeline/finishedFolders && \
    fc-cache -f -v && \
    chmod +x /scripts/* && \
    chmod +x /scripts/init.sh && \
    # User permissions
    addgroup -S stirlingpdfgroup && adduser -S stirlingpdfuser -G stirlingpdfgroup && \
    chown -R stirlingpdfuser:stirlingpdfgroup $HOME /scripts /usr/share/fonts/opentype/noto /configs /customFiles /pipeline && \
    chown stirlingpdfuser:stirlingpdfgroup /app.jar

EXPOSE 8080/tcp

# Set user and run command
ENTRYPOINT ["tini", "--", "/scripts/init.sh"]
CMD ["sh", "-c", "java -Dfile.encoding=UTF-8 -jar /app.jar & /opt/venv/bin/unoserver --port 2003 --interface 127.0.0.1"]



================================================
FILE: Dockerfile.dev
================================================
# dockerfile.dev

# Basisimage: Gradle mit JDK 17 (Debian-basiert)
FROM gradle:8.14-jdk17

# Als Root-Benutzer arbeiten, um benötigte Pakete zu installieren
USER root

# Set GRADLE_HOME und füge Gradle zum PATH hinzu
ENV GRADLE_HOME=/opt/gradle
ENV PATH="$GRADLE_HOME/bin:$PATH"

# Update und Installation zusätzlicher Pakete (Debian/Ubuntu-basiert)
RUN apt-get update && apt-get install -y \
  sudo \
  libreoffice \
  poppler-utils \
  qpdf \
# settings.yml | tessdataDir: /usr/share/tesseract-ocr/5/tessdata
  tesseract-ocr \
  tesseract-ocr-eng \
  fonts-terminus fonts-dejavu fonts-font-awesome fonts-noto fonts-noto-core fonts-noto-cjk fonts-noto-extra fonts-liberation fonts-linuxlibertine \
  python3-uno \
  python3-venv \
# ss -tln
  iproute2 \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Setze die Environment Variable für setuptools
ENV SETUPTOOLS_USE_DISTUTILS=local

# Installation der benötigten Python-Pakete
RUN python3 -m venv --system-site-packages /opt/venv \
  && . /opt/venv/bin/activate \
  && pip install --no-cache-dir WeasyPrint pdf2image pillow unoserver opencv-python-headless pre-commit

# Füge den venv-Pfad zur globalen PATH-Variable hinzu, damit die Tools verfügbar sind
ENV PATH="/opt/venv/bin:$PATH"

COPY . /workspace

RUN adduser --disabled-password --gecos '' devuser \
  && chown -R devuser:devuser /home/devuser /workspace
RUN echo "devuser ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/devuser \
  && chmod 0440 /etc/sudoers.d/devuser

# Setze das Arbeitsverzeichnis (wird später per Bind-Mount überschrieben)
WORKDIR /workspace

RUN chmod +x /workspace/.devcontainer/git-init.sh
RUN sudo chmod +x /workspace/.devcontainer/init-setup.sh

# Wechsel zum Nicht‑Root Benutzer
USER devuser



================================================
FILE: Dockerfile.fat
================================================
# Build the application
FROM gradle:8.14-jdk21 AS build

COPY build.gradle .
COPY settings.gradle .
COPY gradlew .
COPY gradle gradle/
RUN ./gradlew build -x spotlessApply -x spotlessCheck -x test -x sonarqube || return 0

# Set the working directory
WORKDIR /app

# Copy the entire project to the working directory
COPY . .

# Build the application with DOCKER_ENABLE_SECURITY=false
RUN DOCKER_ENABLE_SECURITY=true \
    STIRLING_PDF_DESKTOP_UI=false \
    ./gradlew clean build -x spotlessApply -x spotlessCheck -x test -x sonarqube

# Main stage
FROM alpine:3.21.3@sha256:a8560b36e8b8210634f77d9f7f9efd7ffa463e380b75e2e74aff4511df3ef88c

# Copy necessary files
COPY scripts /scripts
COPY pipeline /pipeline
COPY src/main/resources/static/fonts/*.ttf /usr/share/fonts/opentype/noto/
COPY --from=build /app/build/libs/*.jar app.jar

ARG VERSION_TAG

# Set Environment Variables
ENV DOCKER_ENABLE_SECURITY=false \
    VERSION_TAG=$VERSION_TAG \
    JAVA_BASE_OPTS="-XX:+UnlockExperimentalVMOptions -XX:MaxRAMPercentage=75 -XX:InitiatingHeapOccupancyPercent=20 -XX:+G1PeriodicGCInvokesConcurrent -XX:G1PeriodicGCInterval=10000 -XX:+UseStringDeduplication -XX:G1PeriodicGCSystemLoadThreshold=70" \
    JAVA_CUSTOM_OPTS="" \
    HOME=/home/stirlingpdfuser \
    PUID=1000 \
    PGID=1000 \
    UMASK=022 \
    FAT_DOCKER=true \
    INSTALL_BOOK_AND_ADVANCED_HTML_OPS=false \
    PYTHONPATH=/usr/lib/libreoffice/program:/opt/venv/lib/python3.12/site-packages \
    UNO_PATH=/usr/lib/libreoffice/program \
    URE_BOOTSTRAP=file:///usr/lib/libreoffice/program/fundamentalrc \
    PATH=$PATH:/opt/venv/bin


# JDK for app
RUN echo "@main https://dl-cdn.alpinelinux.org/alpine/edge/main" | tee -a /etc/apk/repositories && \
    echo "@community https://dl-cdn.alpinelinux.org/alpine/edge/community" | tee -a /etc/apk/repositories && \
    echo "@testing https://dl-cdn.alpinelinux.org/alpine/edge/testing" | tee -a /etc/apk/repositories && \
    apk upgrade --no-cache -a && \
    apk add --no-cache \
    ca-certificates \
    tzdata \
    tini \
    bash \
    curl \
    shadow \
    su-exec \
    openssl \
    openssl-dev \
    openjdk21-jre \
    # Doc conversion
    gcompat \
    libc6-compat \
    libreoffice \
    # pdftohtml
    poppler-utils \
    # OCR MY PDF (unpaper for descew and other advanced featues)
    qpdf \
    tesseract-ocr-data-eng \
    tesseract-ocr-data-chi_sim \
	tesseract-ocr-data-deu \
	tesseract-ocr-data-fra \
	tesseract-ocr-data-por \
    font-terminus font-dejavu font-noto font-noto-cjk font-awesome font-noto-extra font-liberation font-linux-libertine \
    # CV
    py3-opencv \
    python3 \
    py3-pip \
    py3-pillow@testing \
    py3-pdf2image@testing && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade unoserver weasyprint && \
    ln -s /usr/lib/libreoffice/program/uno.py /opt/venv/lib/python3.12/site-packages/ && \
    ln -s /usr/lib/libreoffice/program/unohelper.py /opt/venv/lib/python3.12/site-packages/ && \
    ln -s /usr/lib/libreoffice/program /opt/venv/lib/python3.12/site-packages/LibreOffice && \
    mv /usr/share/tessdata /usr/share/tessdata-original && \
    mkdir -p $HOME /configs /logs /customFiles /pipeline/watchedFolders /pipeline/finishedFolders && \
    fc-cache -f -v && \
    chmod +x /scripts/* && \
    chmod +x /scripts/init.sh && \
    # User permissions
    addgroup -S stirlingpdfgroup && adduser -S stirlingpdfuser -G stirlingpdfgroup && \
    chown -R stirlingpdfuser:stirlingpdfgroup $HOME /scripts /usr/share/fonts/opentype/noto /configs /customFiles /pipeline && \
    chown stirlingpdfuser:stirlingpdfgroup /app.jar

EXPOSE 8080/tcp
# Set user and run command
ENTRYPOINT ["tini", "--", "/scripts/init.sh"]
CMD ["sh", "-c", "java -Dfile.encoding=UTF-8 -jar /app.jar & /opt/venv/bin/unoserver --port 2003 --interface 127.0.0.1"]



================================================
FILE: Dockerfile.ultra-lite
================================================
# use alpine
FROM alpine:3.21.3@sha256:a8560b36e8b8210634f77d9f7f9efd7ffa463e380b75e2e74aff4511df3ef88c

ARG VERSION_TAG

# Set Environment Variables
ENV DOCKER_ENABLE_SECURITY=false \
    HOME=/home/stirlingpdfuser \
    VERSION_TAG=$VERSION_TAG \
    JAVA_BASE_OPTS="-XX:+UnlockExperimentalVMOptions -XX:MaxRAMPercentage=75 -XX:InitiatingHeapOccupancyPercent=20 -XX:+G1PeriodicGCInvokesConcurrent -XX:G1PeriodicGCInterval=10000 -XX:+UseStringDeduplication -XX:G1PeriodicGCSystemLoadThreshold=70" \
    JAVA_CUSTOM_OPTS="" \
    PUID=1000 \
    PGID=1000 \
    UMASK=022

# Copy necessary files
COPY scripts/download-security-jar.sh /scripts/download-security-jar.sh
COPY scripts/init-without-ocr.sh /scripts/init-without-ocr.sh
COPY scripts/installFonts.sh /scripts/installFonts.sh
COPY pipeline /pipeline
COPY build/libs/*.jar app.jar

# Set up necessary directories and permissions
RUN echo "@testing https://dl-cdn.alpinelinux.org/alpine/edge/main" | tee -a /etc/apk/repositories && \
    echo "@testing https://dl-cdn.alpinelinux.org/alpine/edge/community" | tee -a /etc/apk/repositories && \
    echo "@testing https://dl-cdn.alpinelinux.org/alpine/edge/testing" | tee -a /etc/apk/repositories && \
    apk upgrade --no-cache -a && \
    apk add --no-cache \
        ca-certificates \
        tzdata \
        tini \
        bash \
        curl \
        shadow \
        su-exec \
        openjdk21-jre && \
    # User permissions
    mkdir -p /configs /logs /customFiles /usr/share/fonts/opentype/noto && \
    chmod +x /scripts/*.sh && \
    addgroup -S stirlingpdfgroup && adduser -S stirlingpdfuser -G stirlingpdfgroup && \
    chown -R stirlingpdfuser:stirlingpdfgroup $HOME /scripts  /configs /customFiles /pipeline && \
    chown stirlingpdfuser:stirlingpdfgroup /app.jar

# Set environment variables
ENV ENDPOINTS_GROUPS_TO_REMOVE=CLI

EXPOSE 8080/tcp

# Run the application
ENTRYPOINT ["tini", "--", "/scripts/init-without-ocr.sh"]
CMD ["java", "-Dfile.encoding=UTF-8", "-jar", "/app.jar"]



================================================
FILE: gradle.properties
================================================
# Enables parallel execution of tasks, allowing multiple tasks to run simultaneously
org.gradle.parallel=true

# Enables build caching to reuse outputs from previous builds for faster execution
# org.gradle.caching=true

org.gradle.build-scan=true



================================================
FILE: gradlew
================================================
#!/bin/sh

#
# Copyright © 2015-2021 the original authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# SPDX-License-Identifier: Apache-2.0
#

##############################################################################
#
#   Gradle start up script for POSIX generated by Gradle.
#
#   Important for running:
#
#   (1) You need a POSIX-compliant shell to run this script. If your /bin/sh is
#       noncompliant, but you have some other compliant shell such as ksh or
#       bash, then to run this script, type that shell name before the whole
#       command line, like:
#
#           ksh Gradle
#
#       Busybox and similar reduced shells will NOT work, because this script
#       requires all of these POSIX shell features:
#         * functions;
#         * expansions «$var», «${var}», «${var:-default}», «${var+SET}»,
#           «${var#prefix}», «${var%suffix}», and «$( cmd )»;
#         * compound commands having a testable exit status, especially «case»;
#         * various built-in commands including «command», «set», and «ulimit».
#
#   Important for patching:
#
#   (2) This script targets any POSIX shell, so it avoids extensions provided
#       by Bash, Ksh, etc; in particular arrays are avoided.
#
#       The "traditional" practice of packing multiple parameters into a
#       space-separated string is a well documented source of bugs and security
#       problems, so this is (mostly) avoided, by progressively accumulating
#       options in "$@", and eventually passing that to Java.
#
#       Where the inherited environment variables (DEFAULT_JVM_OPTS, JAVA_OPTS,
#       and GRADLE_OPTS) rely on word-splitting, this is performed explicitly;
#       see the in-line comments for details.
#
#       There are tweaks for specific operating systems such as AIX, CygWin,
#       Darwin, MinGW, and NonStop.
#
#   (3) This script is generated from the Groovy template
#       https://github.com/gradle/gradle/blob/HEAD/platforms/jvm/plugins-application/src/main/resources/org/gradle/api/internal/plugins/unixStartScript.txt
#       within the Gradle project.
#
#       You can find Gradle at https://github.com/gradle/gradle/.
#
##############################################################################

# Attempt to set APP_HOME

# Resolve links: $0 may be a link
app_path=$0

# Need this for daisy-chained symlinks.
while
    APP_HOME=${app_path%"${app_path##*/}"}  # leaves a trailing /; empty if no leading path
    [ -h "$app_path" ]
do
    ls=$( ls -ld "$app_path" )
    link=${ls#*' -> '}
    case $link in             #(
      /*)   app_path=$link ;; #(
      *)    app_path=$APP_HOME$link ;;
    esac
done

# This is normally unused
# shellcheck disable=SC2034
APP_BASE_NAME=${0##*/}
# Discard cd standard output in case $CDPATH is set (https://github.com/gradle/gradle/issues/25036)
APP_HOME=$( cd -P "${APP_HOME:-./}" > /dev/null && printf '%s\n' "$PWD" ) || exit

# Use the maximum available, or set MAX_FD != -1 to use that value.
MAX_FD=maximum

warn () {
    echo "$*"
} >&2

die () {
    echo
    echo "$*"
    echo
    exit 1
} >&2

# OS specific support (must be 'true' or 'false').
cygwin=false
msys=false
darwin=false
nonstop=false
case "$( uname )" in                #(
  CYGWIN* )         cygwin=true  ;; #(
  Darwin* )         darwin=true  ;; #(
  MSYS* | MINGW* )  msys=true    ;; #(
  NONSTOP* )        nonstop=true ;;
esac

CLASSPATH="\\\"\\\""


# Determine the Java command to use to start the JVM.
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        # IBM's JDK on AIX uses strange locations for the executables
        JAVACMD=$JAVA_HOME/jre/sh/java
    else
        JAVACMD=$JAVA_HOME/bin/java
    fi
    if [ ! -x "$JAVACMD" ] ; then
        die "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
    fi
else
    JAVACMD=java
    if ! command -v java >/dev/null 2>&1
    then
        die "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
    fi
fi

# Increase the maximum file descriptors if we can.
if ! "$cygwin" && ! "$darwin" && ! "$nonstop" ; then
    case $MAX_FD in #(
      max*)
        # In POSIX sh, ulimit -H is undefined. That's why the result is checked to see if it worked.
        # shellcheck disable=SC2039,SC3045
        MAX_FD=$( ulimit -H -n ) ||
            warn "Could not query maximum file descriptor limit"
    esac
    case $MAX_FD in  #(
      '' | soft) :;; #(
      *)
        # In POSIX sh, ulimit -n is undefined. That's why the result is checked to see if it worked.
        # shellcheck disable=SC2039,SC3045
        ulimit -n "$MAX_FD" ||
            warn "Could not set maximum file descriptor limit to $MAX_FD"
    esac
fi

# Collect all arguments for the java command, stacking in reverse order:
#   * args from the command line
#   * the main class name
#   * -classpath
#   * -D...appname settings
#   * --module-path (only if needed)
#   * DEFAULT_JVM_OPTS, JAVA_OPTS, and GRADLE_OPTS environment variables.

# For Cygwin or MSYS, switch paths to Windows format before running java
if "$cygwin" || "$msys" ; then
    APP_HOME=$( cygpath --path --mixed "$APP_HOME" )
    CLASSPATH=$( cygpath --path --mixed "$CLASSPATH" )

    JAVACMD=$( cygpath --unix "$JAVACMD" )

    # Now convert the arguments - kludge to limit ourselves to /bin/sh
    for arg do
        if
            case $arg in                                #(
              -*)   false ;;                            # don't mess with options #(
              /?*)  t=${arg#/} t=/${t%%/*}              # looks like a POSIX filepath
                    [ -e "$t" ] ;;                      #(
              *)    false ;;
            esac
        then
            arg=$( cygpath --path --ignore --mixed "$arg" )
        fi
        # Roll the args list around exactly as many times as the number of
        # args, so each arg winds up back in the position where it started, but
        # possibly modified.
        #
        # NB: a `for` loop captures its iteration list before it begins, so
        # changing the positional parameters here affects neither the number of
        # iterations, nor the values presented in `arg`.
        shift                   # remove old arg
        set -- "$@" "$arg"      # push replacement arg
    done
fi


# Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'

# Collect all arguments for the java command:
#   * DEFAULT_JVM_OPTS, JAVA_OPTS, and optsEnvironmentVar are not allowed to contain shell fragments,
#     and any embedded shellness will be escaped.
#   * For example: A user cannot expect ${Hostname} to be expanded, as it is an environment variable and will be
#     treated as '${Hostname}' itself on the command line.

set -- \
        "-Dorg.gradle.appname=$APP_BASE_NAME" \
        -classpath "$CLASSPATH" \
        -jar "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" \
        "$@"

# Stop when "xargs" is not available.
if ! command -v xargs >/dev/null 2>&1
then
    die "xargs is not available"
fi

# Use "xargs" to parse quoted args.
#
# With -n1 it outputs one arg per line, with the quotes and backslashes removed.
#
# In Bash we could simply go:
#
#   readarray ARGS < <( xargs -n1 <<<"$var" ) &&
#   set -- "${ARGS[@]}" "$@"
#
# but POSIX shell has neither arrays nor command substitution, so instead we
# post-process each arg (as a line of input to sed) to backslash-escape any
# character that might be a shell metacharacter, then use eval to reverse
# that process (while maintaining the separation between arguments), and wrap
# the whole thing up as a single "set" statement.
#
# This will of course break if any of these variables contains a newline or
# an unmatched quote.
#

eval "set -- $(
        printf '%s\n' "$DEFAULT_JVM_OPTS $JAVA_OPTS $GRADLE_OPTS" |
        xargs -n1 |
        sed ' s~[^-[:alnum:]+,./:=@_]~\\&~g; ' |
        tr '\n' ' '
    )" '"$@"'

exec "$JAVACMD" "$@"



================================================
FILE: gradlew.bat
================================================
@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem
@rem SPDX-License-Identifier: Apache-2.0
@rem

@if "%DEBUG%"=="" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
@rem This is normally unused
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if %ERRORLEVEL% equ 0 goto execute

echo. 1>&2
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH. 1>&2
echo. 1>&2
echo Please set the JAVA_HOME variable in your environment to match the 1>&2
echo location of your Java installation. 1>&2

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo. 1>&2
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME% 1>&2
echo. 1>&2
echo Please set the JAVA_HOME variable in your environment to match the 1>&2
echo location of your Java installation. 1>&2

goto fail

:execute
@rem Setup the command line

set CLASSPATH=


@rem Execute Gradle
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" -jar "%APP_HOME%\gradle\wrapper\gradle-wrapper.jar" %*

:end
@rem End local scope for the variables with windows NT shell
if %ERRORLEVEL% equ 0 goto mainEnd

:fail
rem Set variable GRADLE_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd.exe /c_ return code!
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% equ 0 set EXIT_CODE=1
if not ""=="%GRADLE_EXIT_CONSOLE%" exit %EXIT_CODE%
exit /b %EXIT_CODE%

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega



================================================
FILE: HowToAddNewLanguage.md
================================================
<p align="center">
  <img src="https://raw.githubusercontent.com/Stirling-Tools/Stirling-PDF/main/docs/stirling.png" width="80">
  <br>
  <h1 align="center">Stirling-PDF</h1>
</p>

# How to add new languages to Stirling-PDF

Fork Stirling-PDF and create a new branch out of `main`.

Then add a reference to the language in the navbar by adding a new language entry to the dropdown:

- Edit the file: [languages.html](https://github.com/Stirling-Tools/Stirling-PDF/blob/main/src/main/resources/templates/fragments/languages.html)


For example, to add Polish, you would add:

```html
<div th:replace="~{fragments/languageEntry :: languageEntry ('pl_PL', 'Polski')}" ></div>
```

The `data-bs-language-code` is the code used to reference the file in the next step.

### Add Language Property File

Start by copying the existing English property file:

- [messages_en_GB.properties](https://github.com/Stirling-Tools/Stirling-PDF/blob/main/src/main/resources/messages_en_GB.properties)

Copy and rename it to `messages_{your data-bs-language-code here}.properties`. In the Polish example, you would set the name to `messages_pl_PL.properties`.

Then simply translate all property entries within that file and make a Pull Request (PR) into `main` for others to use!

If you do not have a Java IDE, I am happy to verify that the changes work once you raise the PR (but I won't be able to verify the translations themselves).

## Handling Untranslatable Strings

Sometimes, certain strings in the properties file may not require translation because they are the same in the target language or are universal (like names of protocols, certain terminologies, etc.). To ensure accurate statistics for language progress, these strings should be added to the `ignore_translation.toml` file located in the `scripts` directory. This will exclude them from the translation progress calculations.

For example, if the English string `error=Error` does not need translation in Polish, add it to the `ignore_translation.toml` under the Polish section:

```toml
[pl_PL]
ignore = [
    "language.direction",  # Existing entries
    "error"                # Add new entries here
]
```

## Add New Translation Tags

> [!IMPORTANT]
> If you add any new translation tags, they must first be added to the `messages_en_GB.properties` file. This ensures consistency across all language files.

- New translation tags **must be added** to the `messages_en_GB.properties` file to maintain a reference for other languages.
- After adding the new tags to `messages_en_GB.properties`, add and translate them in the respective language file (e.g., `messages_pl_PL.properties`).

Make sure to place the entry under the correct language section. This helps maintain the accuracy of translation progress statistics and ensures that the translation tool or scripts do not misinterpret the completion rate.

### Use this code to perform a local check

#### Windows command

```ps
python .github/scripts/check_language_properties.py --reference-file src\main\resources\messages_en_GB.properties --branch "" --files src\main\resources\messages_pl_PL.properties

python .github/scripts/check_language_properties.py --reference-file src\main\resources\messages_en_GB.properties --branch "" --check-file src\main\resources\messages_pl_PL.properties
```



================================================
FILE: HowToUseOCR.md
================================================
# OCR Language Packs and Setup

This document provides instructions on how to add additional language packs for the OCR tab in Stirling-PDF, both inside and outside of Docker.

## My OCR used to work and now doesn't!

The paths have changed for the tessdata locations on new Docker images. Please use `/usr/share/tessdata` (Others should still work for backward compatibility but might not).

## How does the OCR Work

Stirling-PDF uses Tesseract for its text recognition. All credit goes to them for this awesome work!

## Language Packs

Tesseract OCR supports a variety of languages. You can find additional language packs in the Tesseract GitHub repositories:

- [tessdata_fast](https://github.com/tesseract-ocr/tessdata_fast): These language packs are smaller and faster to load but may provide lower recognition accuracy.
- [tessdata](https://github.com/tesseract-ocr/tessdata): These language packs are larger and provide better recognition accuracy, but may take longer to load.

Depending on your requirements, you can choose the appropriate language pack for your use case. By default, Stirling-PDF uses `tessdata_fast` for English, but this can be replaced.

### Installing Language Packs

1. Download the desired language pack(s) by selecting the `.traineddata` file(s) for the language(s) you need.
2. Place the `.traineddata` files in the Tesseract tessdata directory: `/usr/share/tessdata`

**DO NOT REMOVE EXISTING `eng.traineddata`, IT'S REQUIRED.**

### Docker Setup

If you are using Docker, you need to expose the Tesseract tessdata directory as a volume in order to use the additional language packs.

#### Docker Compose

Modify your `docker-compose.yml` file to include the following volume configuration:

```yaml
services:
  your_service_name:
    image: your_docker_image_name
    volumes:
      - /location/of/trainingData:/usr/share/tessdata
```

#### Docker Run

Add the following to your existing Docker run command:

```bash
-v /location/of/trainingData:/usr/share/tessdata
```

### Non-Docker Setup

For Debian-based systems, install languages with this command:

```bash
sudo apt update &&\
# All languages
# sudo apt install -y 'tesseract-ocr-*'

# Find languages:
apt search tesseract-ocr-

# View installed languages:
dpkg-query -W tesseract-ocr- | sed 's/tesseract-ocr-//g'
```

For Fedora:

```bash
# All languages
# sudo dnf install -y tesseract-langpack-*

# Find languages:
dnf search -C tesseract-langpack-

# View installed languages:
rpm -qa | grep tesseract-langpack | sed 's/tesseract-langpack-//g'
```

For Windows:

You must ensure tesseract is installed

Additional languages must be downloaded manually:
Download desired .traineddata files from tessdata or tessdata_fast
Place them in the tessdata folder within your Tesseract installation directory
(e.g., C:\Program Files\Tesseract-OCR\tessdata)

Verify installation:
``tesseract --list-langs``

You must then edit your ``/configs/settings.yml`` and change the system.tessdataDir to match the directory containing lang files

```
system:
 tessdataDir: C:/Program Files/Tesseract-OCR/tessdata # path to the directory containing the Tessdata files. This setting is relevant for Windows systems. For Windows users, this path should be adjusted to point to the appropriate directory where the Tessdata files are stored.
```
  


================================================
FILE: lauch4jConfig.xml
================================================
<?xml version="1.0" encoding="UTF-8"?>
<launch4jConfig>
  <dontWrapJar>false</dontWrapJar>
  <headerType>console</headerType>
  <jar>.\build\libs\S-PDF-0.10.1.jar</jar>
  <outfile>.\Stirling-PDF.exe</outfile>
  <errTitle>Please download Java17</errTitle>
  <cmdLine></cmdLine>
  <chdir>.</chdir>
  <priority>normal</priority>
  <downloadUrl>https://download.oracle.com/java/17/latest/jdk-17_windows-x64_bin.exe</downloadUrl>
  <supportUrl></supportUrl>
  <stayAlive>false</stayAlive>
  <restartOnCrash>false</restartOnCrash>
  <manifest></manifest>
  <icon>./src/main/resources/static/favicon.ico</icon>
  <var>BROWSER_OPEN=true</var>
  <singleInstance>
    <mutexName>Stirling-PDF</mutexName>
    <windowTitle>Stirling-PDF</windowTitle>
  </singleInstance>
  <jre>
    <path>%JAVA_HOME%;%PATH%</path>
    <requiresJdk>false</requiresJdk>
    <requires64Bit>false</requires64Bit>
    <minVersion>17</minVersion>
    <maxVersion></maxVersion>
  </jre>
  <messages>
    <startupErr>An error occurred while starting Stirling-PDF</startupErr>
    <jreNotFoundErr>This application requires a Java Runtime Environment, Please download Java 17.</jreNotFoundErr>
    <jreVersionErr>You are running the wrong version of Java, Please download Java 17.</jreVersionErr>
    <launcherErr>Java is corrupted. Please uninstall and then install  Java 17.</launcherErr>
    <instanceAlreadyExistsMsg>Stirling-PDF is already running.</instanceAlreadyExistsMsg>
  </messages>
</launch4jConfig>


================================================
FILE: LICENSE
================================================
MIT License

Copyright (c) 2024 Stirling Tools

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



================================================
FILE: SECURITY.md
================================================
# Security Policy

## Reporting a Vulnerability

The Stirling-PDF team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

You can report security vulnerabilities through two channels:

1. **GitHub Security Advisory**:
   - Navigate to the [Security tab](https://github.com/Stirling-Tools/Stirling-PDF/security) in our repository
   - Click on "Report a vulnerability"
   - Provide a detailed description of the vulnerability

2. **Direct Email**:
   - Send your report to security@stirlingpdf.com
   - Please include as much information as possible about the vulnerability

### What to Include

When reporting a vulnerability, please provide:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Any potential impact
- If possible, suggestions for addressing the vulnerability
- Your contact information for follow-up questions

### Response Time

We aim to acknowledge receipt of your vulnerability report within 48 hours

### Process

1. Submit your report through one of the channels above
2. Receive an acknowledgment from our team
3. Our team will investigate and validate the issue
4. We will work on a fix and keep you updated on our progress
5. Once resolved, we will publish the fix and acknowledge your contribution (if desired)

### Bug Bounty

At this time, we do not offer a bug bounty program. However, we greatly appreciate your efforts in making Stirling-PDF more secure and will acknowledge your contribution in our release notes (unless you prefer to remain anonymous).

## Supported Versions

Only the latest version of Stirling-PDF is supported for security updates. We do not backport security fixes to older versions.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Older   | :x:               |

**Please note:** Before reporting a security issue, ensure you are using the latest version of Stirling-PDF. Security reports for older versions will not be accepted.

## Security Best Practices

When deploying Stirling-PDF:

1. Always use the latest version
2. Follow our deployment guidelines
3. Regularly check for and apply updates



================================================
FILE: USERS.md
================================================
# Who is using Stirling-PDF?

Understanding the diverse applications of Stirling-PDF can be an invaluable resource for collaboration and learning. This page provides a directory of users and use cases. If you are using Stirling-PDF, consider sharing your experiences to help others and foster a community of best practices.

## Adding Yourself as a User

If you're using Stirling-PDF or have integrated it into your platform or workflow, please consider contributing to this list by describing your use case. You can do this by opening a pull request to this file and adding your details in the format below:

- **N**: Name of the organization or individual.
- **D**: A brief description of your usage.
- **U**: Specific features or capabilities utilized.
- **L**: Optional link for further information (e.g., website, blog post).
- **Q**: Contact information for sharing insights (optional).

Example entry:

```
* N: Example Corp
  D: Using Stirling-PDF for automated document processing in our SaaS platform focusing on compression.
  U: OCR, merging PDFs, metadata editing, encryption, compression.
  L: https://example.com/stirling-pdf
  Q: @example-user on Discord/email
```

---

## Requirements for Listing

- You must represent the entity you're listing and ensure the details are accurate.
- Trial deployments are welcome if they represent a realistic evaluation of Stirling-PDF in action.
- Community contributions, including home-lab setups or non-commercial uses, are encouraged.

---

## Users (Alphabetically)

    * N: 
      D: 
      U: 
      L: 

    * N: 
      D: 
      U: 
      L: 



================================================
FILE: .editorconfig
================================================
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
max_line_length = 127
insert_final_newline = true
trim_trailing_whitespace = true

[*.java]
indent_size = 4
max_line_length = 100

[*.py]
indent_size = 2

[*.gradle]
indent_size = 4

[*.html]
indent_size = 2
insert_final_newline = false
trim_trailing_whitespace = false

[*.js]
indent_size = 2

[*.yaml]
insert_final_newline = false
trim_trailing_whitespace = false



================================================
FILE: .git-blame-ignore-revs
================================================
# Formatting
5f771b785130154ed47952635b7acef371ffe0ec

# Normalize files
55d4fda01b2f39f5b7d7b4fda5214bd7ff0fd5dd



================================================
FILE: .pre-commit-config.yaml
================================================
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.11.6
    hooks:
      - id: ruff
        args:
          - --fix
          - --line-length=127
        files: ^((\.github/scripts|scripts)/.+)?[^/]+\.py$
        exclude: (split_photos.py)
      - id: ruff-format
        files: ^((\.github/scripts|scripts)/.+)?[^/]+\.py$
        exclude: (split_photos.py)
  - repo: https://github.com/codespell-project/codespell
    rev: v2.4.1
    hooks:
      - id: codespell
        args:
          - --ignore-words-list=
          - --skip="./.*,*.csv,*.json,*.ambr"
          - --quiet-level=2
        files: \.(html|css|js|py|md)$
        exclude: (.vscode|.devcontainer|src/main/resources|Dockerfile|.*/pdfjs.*|.*/thirdParty.*|bootstrap.*|.*\.min\..*|.*diff\.js)
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.24.3
    hooks:
      - id: gitleaks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: end-of-file-fixer
        files: ^.*(\.js|\.java|\.py|\.yml)$
        exclude: ^(.*/pdfjs.*|.*/thirdParty.*|bootstrap.*|.*\.min\..*|.*diff\.js|\.github/workflows/.*$)
      - id: trailing-whitespace
        files: ^.*(\.js|\.java|\.py|\.yml)$
        exclude: ^(.*/pdfjs.*|.*/thirdParty.*|bootstrap.*|.*\.min\..*|.*diff\.js|\.github/workflows/.*$)




================================================
FILE: exampleYmlFiles/docker-compose-latest-fat-endpoints-disabled.yml
================================================

services:
  stirling-pdf:
    container_name: Stirling-PDF-Fat-Disable-Endpoints
    image: docker.stirlingpdf.com/stirlingtools/stirling-pdf:latest-fat
    deploy:
      resources:
        limits:
          memory: 4G
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/api/v1/info/status | grep -q 'UP'"]
      interval: 5s
      timeout: 10s
      retries: 16
    ports:
      - 8080:8080
    volumes:
      - ./stirling/latest/data:/usr/share/tessdata:rw
      - ./stirling/latest/config:/configs:rw
      - ./stirling/latest/logs:/logs:rw
      - ../testing/allEndpointsRemovedSettings.yml:/configs/settings.yml:rw
    environment:
      DOCKER_ENABLE_SECURITY: "true"
      SECURITY_ENABLELOGIN: "false"
      PUID: 1002
      PGID: 1002
      UMASK: "022"
      SYSTEM_DEFAULTLOCALE: en-US
      UI_APPNAME: Stirling-PDF
      UI_HOMEDESCRIPTION: Demo site for Stirling-PDF Latest-fat with  all Endpoints Disabled
      UI_APPNAMENAVBAR: Stirling-PDF Latest-fat
      SYSTEM_MAXFILESIZE: "100"
      METRICS_ENABLED: "true"
      SYSTEM_GOOGLEVISIBILITY: "true"
      SHOW_SURVEY: "true"
    restart: on-failure:5



================================================
FILE: exampleYmlFiles/docker-compose-latest-fat-security-postgres.yml
================================================
services:
  stirling-pdf:
    container_name: Stirling-PDF-Security-Fat-Postgres
    image: docker.stirlingpdf.com/stirlingtools/stirling-pdf:latest-fat-postgres
    deploy:
      resources:
        limits:
          memory: 4G
    depends_on:
      - db
    healthcheck:
      test: [ "CMD-SHELL", "curl -f http://localhost:8080/api/v1/info/status | grep -q 'UP'" ]
      interval: 5s
      timeout: 10s
      retries: 16
    ports:
      - 8080:8080
    volumes:
      - ./stirling/latest/data:/usr/share/tessdata:rw
      - ./stirling/latest/config:/configs:rw
      - ./stirling/latest/logs:/logs:rw
    environment:
      DOCKER_ENABLE_SECURITY: "true"
      SECURITY_ENABLELOGIN: "false"
      PUID: 1002
      PGID: 1002
      UMASK: "022"
      SYSTEM_DEFAULTLOCALE: en-US
      UI_APPNAME: Stirling-PDF
      UI_HOMEDESCRIPTION: Demo site for Stirling-PDF Latest-fat with Security and PostgreSQL
      UI_APPNAMENAVBAR: Stirling-PDF Latest-fat-PostgreSQL
      SYSTEM_MAXFILESIZE: "100"
      METRICS_ENABLED: "true"
      SYSTEM_GOOGLEVISIBILITY: "true"
      SYSTEM_DATASOURCE_ENABLECUSTOMDATABASE: "true"
      SYSTEM_DATASOURCE_CUSTOMDATABASEURL: "jdbc:postgresql://db:5432/stirling_pdf"
      SYSTEM_DATASOURCE_USERNAME: "admin"
      SYSTEM_DATASOURCE_PASSWORD: "stirling"
      SHOW_SURVEY: "true"
    restart: on-failure:5

  db:
    image: 'postgres:17.2-alpine'
    restart: on-failure:5
    container_name: db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: "stirling_pdf"
      POSTGRES_USER: "admin"
      POSTGRES_PASSWORD: "stirling"
    shm_size: "512mb"
    deploy:
      resources:
        limits:
          memory: 512m
          cpus: "0.5"
    healthcheck:
      test: [ "CMD-SHELL", "pg_isready -U admin stirling_pdf" ]
      interval: 1s
      timeout: 5s
      retries: 10
    volumes:
      - ./stirling/latest/data:/pgdata



================================================
FILE: exampleYmlFiles/docker-compose-latest-fat-security.yml
================================================
services:
  stirling-pdf:
    container_name: Stirling-PDF-Security-Fat
    image: docker.stirlingpdf.com/stirlingtools/stirling-pdf:latest-fat
    deploy:
      resources:
        limits:
          memory: 4G
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/api/v1/info/status | grep -q 'UP'"]
      interval: 5s
      timeout: 10s
      retries: 16
    ports:
      - 8080:8080
    volumes:
      - ./stirling/latest/data:/usr/share/tessdata:rw
      - ./stirling/latest/config:/configs:rw
      - ./stirling/latest/logs:/logs:rw
    environment:
      DOCKER_ENABLE_SECURITY: "true"
      SECURITY_ENABLELOGIN: "false"
      PUID: 1002
      PGID: 1002
      UMASK: "022"
      SYSTEM_DEFAULTLOCALE: en-US
      UI_APPNAME: Stirling-PDF
      UI_HOMEDESCRIPTION: Demo site for Stirling-PDF Latest-fat with Security
      UI_APPNAMENAVBAR: Stirling-PDF Latest-fat
      SYSTEM_MAXFILESIZE: "100"
      METRICS_ENABLED: "true"
      SYSTEM_GOOGLEVISIBILITY: "true"
      SHOW_SURVEY: "true"
    restart: on-failure:5



================================================
FILE: exampleYmlFiles/docker-compose-latest-security-with-sso.yml
================================================
services:
  stirling-pdf:
    container_name: Stirling-PDF-Security
    image: docker.stirlingpdf.com/stirlingtools/stirling-pdf:latest
    deploy:
      resources:
        limits:
          memory: 4G
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/api/v1/info/status | grep -q 'UP' && curl -fL http://localhost:8080/ | grep -q 'Please sign in'"]
      interval: 5s
      timeout: 10s
      retries: 16
    ports:
      - "8080:8080"
    volumes:
      - /stirling/latest/data:/usr/share/tessdata:rw
      - /stirling/latest/config:/configs:rw
      - /stirling/latest/logs:/logs:rw
    environment:
      DOCKER_ENABLE_SECURITY: "true"
      SECURITY_ENABLELOGIN: "true"
      SECURITY_OAUTH2_ENABLED: "true"
      SECURITY_OAUTH2_AUTOCREATEUSER: "true" # This is set to true to allow auto-creation of non-existing users in Stirling-PDF
      SECURITY_OAUTH2_ISSUER: "https://accounts.google.com"  # Change with any other provider that supports OpenID Connect Discovery (/.well-known/openid-configuration) end-point
      SECURITY_OAUTH2_CLIENTID: "<YOUR CLIENT ID>.apps.googleusercontent.com" # Client ID from your provider
      SECURITY_OAUTH2_CLIENTSECRET: "<YOUR CLIENT SECRET>"  # Client Secret from your provider
      SECURITY_OAUTH2_SCOPES: "openid,profile,email" # Expected OAuth2 Scope
      SECURITY_OAUTH2_USEASUSERNAME: "email" # Default is 'email'; custom fields can be used as the username
      SECURITY_OAUTH2_PROVIDER: "google" # Set this to your OAuth provider's name, e.g., 'google' or 'keycloak'
      PUID: 1002
      PGID: 1002
      UMASK: "022"
      SYSTEM_DEFAULTLOCALE: en-US
      UI_APPNAME: Stirling-PDF
      UI_HOMEDESCRIPTION: Demo site for Stirling-PDF Latest with Security
      UI_APPNAMENAVBAR: Stirling-PDF Latest
      SYSTEM_MAXFILESIZE: "100"
      METRICS_ENABLED: "true"
      SYSTEM_GOOGLEVISIBILITY: "true"
      SHOW_SURVEY: "true"
    restart: on-failure:5



================================================
FILE: exampleYmlFiles/docker-compose-latest-security.yml
================================================
services:
  stirling-pdf:
    container_name: Stirling-PDF-Security
    image: docker.stirlingpdf.com/stirlingtools/stirling-pdf:latest
    deploy:
      resources:
        limits:
          memory: 4G
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/api/v1/info/status | grep -q 'UP' && curl -fL http://localhost:8080/ | grep -q 'Please sign in'"]
      interval: 5s
      timeout: 10s
      retries: 16
    ports:
      - "8080:8080"
    volumes:
      - ./stirling/latest/data:/usr/share/tessdata:rw
      - ./stirling/latest/config:/configs:rw
      - ./stirling/latest/logs:/logs:rw
    environment:
      DOCKER_ENABLE_SECURITY: "true"
      SECURITY_ENABLELOGIN: "true"
      PUID: 1002
      PGID: 1002
      UMASK: "022"
      SYSTEM_DEFAULTLOCALE: en-US
      UI_APPNAME: Stirling-PDF
      UI_HOMEDESCRIPTION: Demo site for Stirling-PDF Latest with Security
      UI_APPNAMENAVBAR: Stirling-PDF Latest
      SYSTEM_MAXFILESIZE: "100"
      METRICS_ENABLED: "true"
      SYSTEM_GOOGLEVISIBILITY: "true"
      SHOW_SURVEY: "true"
    restart: on-failure:5



================================================
FILE: exampleYmlFiles/docker-compose-latest-ultra-lite-security.yml
================================================
services:
  stirling-pdf:
    container_name: Stirling-PDF-Ultra-Lite-Security
    image: docker.stirlingpdf.com/stirlingtools/stirling-pdf:latest-ultra-lite
    deploy:
      resources:
        limits:
          memory: 1G
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/api/v1/info/status | grep -q 'UP' && curl -fL http://localhost:8080/ | grep -q 'Please sign in'"]
      interval: 5s
      timeout: 10s
      retries: 16
    ports:
      - "8080:8080"
    volumes:
      - /stirling/latest/data:/usr/share/tessdata:rw
      - /stirling/latest/config:/configs:rw
      - /stirling/latest/logs:/logs:rw
    environment:
      DOCKER_ENABLE_SECURITY: "true"
      SECURITY_ENABLELOGIN: "true"
      SYSTEM_DEFAULTLOCALE: en-US
      UI_APPNAME: Stirling-PDF-Lite
      UI_HOMEDESCRIPTION: Demo site for Stirling-PDF-Lite Latest with Security
      UI_APPNAMENAVBAR: Stirling-PDF-Lite Latest
      SYSTEM_MAXFILESIZE: "100"
      METRICS_ENABLED: "true"
      SYSTEM_GOOGLEVISIBILITY: "true"
      SHOW_SURVEY: "true"
    restart: on-failure:5



================================================
FILE: exampleYmlFiles/docker-compose-latest-ultra-lite.yml
================================================
services:
  stirling-pdf:
    container_name: Stirling-PDF-Ultra-Lite
    image: docker.stirlingpdf.com/stirlingtools/stirling-pdf:latest-ultra-lite
    deploy:
      resources:
        limits:
          memory: 1G
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/api/v1/info/status | grep -q 'UP' && curl -fL http://localhost:8080/ | grep -qv 'Please sign in'"]
      interval: 5s
      timeout: 10s
      retries: 16
    ports:
      - "8080:8080"
    volumes:
      - /stirling/latest/config:/configs:rw
      - /stirling/latest/logs:/logs:rw
    environment:
      DOCKER_ENABLE_SECURITY: "false"
      SECURITY_ENABLELOGIN: "false"
      SYSTEM_DEFAULTLOCALE: en-US
      UI_APPNAME: Stirling-PDF-Ultra-lite
      UI_HOMEDESCRIPTION: Demo site for Stirling-PDF-Ultra-lite Latest
      UI_APPNAMENAVBAR: Stirling-PDF-Ultra-lite Latest
      SYSTEM_MAXFILESIZE: "100"
      METRICS_ENABLED: "true"
      SYSTEM_GOOGLEVISIBILITY: "true"
      SHOW_SURVEY: "true"
    restart: on-failure:5



================================================
FILE: exampleYmlFiles/docker-compose-latest.yml
================================================
services:
  stirling-pdf:
    container_name: Stirling-PDF
    image: docker.stirlingpdf.com/stirlingtools/stirling-pdf:latest
    deploy:
      resources:
        limits:
          memory: 4G
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/api/v1/info/status | grep -q 'UP' && curl -fL http://localhost:8080/ | grep -qv 'Please sign in'"]
      interval: 5s
      timeout: 10s
      retries: 16
    ports:
      - "8080:8080"
    volumes:
      - /stirling/latest/data:/usr/share/tessdata:rw
      - /stirling/latest/config:/configs:rw
      - /stirling/latest/logs:/logs:rw
    environment:
      DOCKER_ENABLE_SECURITY: "false"
      SECURITY_ENABLELOGIN: "false"
      LANGS: "en_GB,en_US,ar_AR,de_DE,fr_FR,es_ES,zh_CN,zh_TW,ca_CA,it_IT,sv_SE,pl_PL,ro_RO,ko_KR,pt_BR,ru_RU,el_GR,hi_IN,hu_HU,tr_TR,id_ID"
      SYSTEM_DEFAULTLOCALE: en-US
      UI_APPNAME: Stirling-PDF
      UI_HOMEDESCRIPTION: Demo site for Stirling-PDF Latest
      UI_APPNAMENAVBAR: Stirling-PDF Latest
      SYSTEM_MAXFILESIZE: "100"
      METRICS_ENABLED: "true"
      SYSTEM_GOOGLEVISIBILITY: "true"
      SHOW_SURVEY: "true"
    restart: on-failure:5



================================================
FILE: exampleYmlFiles/test_cicd.yml
================================================
services:
  stirling-pdf:
    container_name: Stirling-PDF-Security-Fat-with-login
    image: docker.stirlingpdf.com/stirlingtools/stirling-pdf:latest-fat
    deploy:
      resources:
        limits:
          memory: 4G
    healthcheck:
      test: ["CMD-SHELL", "curl -f -H 'X-API-KEY: 123456789' http://localhost:8080/api/v1/info/status | grep -q 'UP'"]
      interval: 5s
      timeout: 10s
      retries: 16
    ports:
      - 8080:8080
    volumes:
      - /stirling/latest/data:/usr/share/tessdata:rw
      - /stirling/latest/config:/configs:rw
      - /stirling/latest/logs:/logs:rw
    environment:
      DOCKER_ENABLE_SECURITY: "true"
      SECURITY_ENABLELOGIN: "true"
      PUID: 1002
      PGID: 1002
      UMASK: "022"
      SYSTEM_DEFAULTLOCALE: en-US
      UI_APPNAME: Stirling-PDF
      UI_HOMEDESCRIPTION: Demo site for Stirling-PDF Latest-fat with Security
      UI_APPNAMENAVBAR: Stirling-PDF Latest-fat
      SYSTEM_MAXFILESIZE: "100"
      METRICS_ENABLED: "true"
      SYSTEM_GOOGLEVISIBILITY: "true"
      SECURITY_CUSTOMGLOBALAPIKEY: "123456789"
    restart: on-failure:5



================================================
FILE: gradle/wrapper/gradle-wrapper.properties
================================================
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.14-all.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists




================================================
FILE: pipeline/defaultWebUIConfigs/OCR images.json
================================================
{
  "name": "OCR images",
  "pipeline": [
    {
      "operation": "/api/v1/convert/img/pdf",
      "parameters": {
        "fitOption": "fillPage",
        "colorType": "color",
        "autoRotate": true,
        "fileInput": "automated"
      }
    },
    {
      "operation": "/api/v1/general/merge-pdfs",
      "parameters": {
        "sortType": "orderProvided",
        "fileInput": "automated"
      }
    },
    {
      "operation": "/api/v1/misc/ocr-pdf",
      "parameters": {
        "languages": [
          "eng"
        ],
        "sidecar": false,
        "deskew": false,
        "clean": false,
        "cleanFinal": false,
        "ocrType": "skip-text",
        "ocrRenderType": "hocr",
        "removeImagesAfter": false,
        "fileInput": "automated"
      }
    }
  ],
  "_examples": {
    "outputDir": "{outputFolder}/{folderName}",
    "outputFileName": "{filename}-{pipelineName}-{date}-{time}"
  },
  "outputDir": "{outputFolder}",
  "outputFileName": "{filename}"
}


================================================
FILE: pipeline/defaultWebUIConfigs/Prepare-pdfs-for-email.json
================================================
{
  "name": "Prepare-pdfs-for-email",
  "pipeline": [
    {
      "operation": "/api/v1/misc/repair",
      "parameters": {}
    },
    {
      "operation": "/api/v1/security/sanitize-pdf",
      "parameters": {
        "removeJavaScript": true,
        "removeEmbeddedFiles": false,
        "removeMetadata": false,
        "removeLinks": false,
        "removeFonts": false
      }
    },
    {
      "operation": "/api/v1/misc/compress-pdf",
      "parameters": {
        "optimizeLevel": 2,
        "expectedOutputSize": ""
      }
    },
    {
      "operation": "/api/v1/general/split-by-size-or-count",
      "parameters": {
        "splitType": 0,
        "splitValue": "15MB"
      }
    }
  ],
  "_examples": {
    "outputDir": "{outputFolder}/{folderName}",
    "outputFileName": "{filename}-{pipelineName}-{date}-{time}"
  },
  "outputDir": "httpWebRequest",
  "outputFileName": "{filename}"
}


================================================
FILE: pipeline/defaultWebUIConfigs/split-rotate-auto-rename.json
================================================
{
  "name": "split-rotate-auto-rename",
  "pipeline": [
    {
      "operation": "/api/v1/general/split-pdf-by-sections",
      "parameters": {
        "horizontalDivisions": 2,
        "verticalDivisions": 2,
        "fileInput": "automated",
        "merge": false
      }
    },
    {
      "operation": "/api/v1/general/rotate-pdf",
      "parameters": {
        "angle": 90,
        "fileInput": "automated"
      }
    },
    {
      "operation": "/api/v1/misc/auto-rename",
      "parameters": {
        "useFirstTextAsFallback": false,
        "fileInput": "automated"
      }
    }
  ],
  "_examples": {
    "outputDir": "{outputFolder}/{folderName}",
    "outputFileName": "{filename}-{pipelineName}-{date}-{time}"
  },
  "outputDir": "{outputFolder}",
  "outputFileName": "{filename}"
}



================================================
FILE: scripts/counter_translation.py
================================================
"""A script to update language progress status in README.md based on
properties file comparison.

This script compares default properties file with others in a directory to
determine language progress.
It then updates README.md based on provided progress list.

Author: Ludy87

Example:
    To use this script, simply run it from command line:
        $ python counter_translation.py
"""  # noqa: D205

import glob
import os
import re

import tomlkit
import tomlkit.toml_file


def convert_to_multiline(data: tomlkit.TOMLDocument) -> tomlkit.TOMLDocument:
    """Converts 'ignore' and 'missing' arrays to multiline arrays and sorts the first-level keys of the TOML document.
    Enhances readability and consistency in the TOML file by ensuring arrays contain unique and sorted entries.

    Parameters:
        data (tomlkit.TOMLDocument): The original TOML document containing the data.

    Returns:
        tomlkit.TOMLDocument: A new TOML document with sorted keys and properly formatted arrays.
    """  # noqa: D205
    sorted_data = tomlkit.document()
    for key in sorted(data.keys()):
        value = data[key]
        if isinstance(value, dict):
            new_table = tomlkit.table()
            for subkey in ("ignore", "missing"):
                if subkey in value:
                    # Convert the list to a set to remove duplicates, sort it, and convert to multiline for readability
                    unique_sorted_array = sorted(set(value[subkey]))
                    array = tomlkit.array()
                    array.multiline(True)
                    for item in unique_sorted_array:
                        array.append(item)
                    new_table[subkey] = array
            sorted_data[key] = new_table
        else:
            # Add other types of data unchanged
            sorted_data[key] = value
    return sorted_data


def write_readme(progress_list: list[tuple[str, int]]) -> None:
    """Updates the progress status in the README.md file based
    on the provided progress list.

    Parameters:
        progress_list (list[tuple[str, int]]): A list of tuples containing
        language and progress percentage.

    Returns:
        None
    """  # noqa: D205
    with open("README.md", encoding="utf-8") as file:
        content = file.readlines()

    for i, line in enumerate(content[2:], start=2):
        for progress in progress_list:
            language, value = progress
            if language in line:
                if match := re.search(r"\!\[(\d+(\.\d+)?)%\]\(.*\)", line):
                    content[i] = line.replace(
                        match.group(0),
                        f"![{value}%](https://geps.dev/progress/{value})",
                    )

    with open("README.md", "w", encoding="utf-8", newline="\n") as file:
        file.writelines(content)


def compare_files(
    default_file_path, file_paths, ignore_translation_file
) -> list[tuple[str, int]]:
    """Compares the default properties file with other
    properties files in the directory.

    Parameters:
        default_file_path (str): The path to the default properties file.
        files_directory (str): The directory containing other properties files.

    Returns:
        list[tuple[str, int]]: A list of tuples containing
        language and progress percentage.
    """  # noqa: D205
    num_lines = sum(
        1
        for line in open(default_file_path, encoding="utf-8")
        if line.strip() and not line.strip().startswith("#")
    )

    result_list = []
    sort_ignore_translation: tomlkit.TOMLDocument

    # read toml
    with open(ignore_translation_file, encoding="utf-8") as f:
        sort_ignore_translation = tomlkit.parse(f.read())

    for file_path in file_paths:
        language = (
            os.path.basename(file_path)
            .split("messages_", 1)[1]
            .split(".properties", 1)[0]
        )

        fails = 0
        if "en_GB" in language or "en_US" in language:
            result_list.append(("en_GB", 100))
            result_list.append(("en_US", 100))
            continue

        if language not in sort_ignore_translation:
            sort_ignore_translation[language] = tomlkit.table()

        if (
            "ignore" not in sort_ignore_translation[language]
            or len(sort_ignore_translation[language].get("ignore", [])) < 1
        ):
            sort_ignore_translation[language]["ignore"] = tomlkit.array(
                ["language.direction"]
            )

        # if "missing" not in sort_ignore_translation[language]:
        #     sort_ignore_translation[language]["missing"] = tomlkit.array()
        # elif "language.direction" in sort_ignore_translation[language]["missing"]:
        #     sort_ignore_translation[language]["missing"].remove("language.direction")

        with (
            open(default_file_path, encoding="utf-8") as default_file,
            open(file_path, encoding="utf-8") as file,
        ):
            for _ in range(5):
                next(default_file)
                try:
                    next(file)
                except StopIteration:
                    fails = num_lines

            for line_num, (line_default, line_file) in enumerate(
                zip(default_file, file), start=6
            ):
                try:
                    # Ignoring empty lines and lines start with #
                    if line_default.strip() == "" or line_default.startswith("#"):
                        continue
                    default_key, default_value = line_default.split("=", 1)
                    file_key, file_value = line_file.split("=", 1)
                    if (
                        default_value.strip() == file_value.strip()
                        and default_key.strip()
                        not in sort_ignore_translation[language]["ignore"]
                    ):
                        print(
                            f"{language}: Line {line_num} is missing the translation."
                        )
                        # if default_key.strip() not in sort_ignore_translation[language]["missing"]:
                        #     missing_array = tomlkit.array()
                        #     missing_array.append(default_key.strip())
                        #     missing_array.multiline(True)
                        #     sort_ignore_translation[language]["missing"].extend(missing_array)
                        fails += 1
                    # elif default_key.strip() in sort_ignore_translation[language]["ignore"]:
                    #     if default_key.strip() in sort_ignore_translation[language]["missing"]:
                    #         sort_ignore_translation[language]["missing"].remove(default_key.strip())
                    if default_value.strip() != file_value.strip():
                        # if default_key.strip() in sort_ignore_translation[language]["missing"]:
                        #     sort_ignore_translation[language]["missing"].remove(default_key.strip())
                        if (
                            default_key.strip()
                            in sort_ignore_translation[language]["ignore"]
                        ):
                            sort_ignore_translation[language]["ignore"].remove(
                                default_key.strip()
                            )
                except ValueError:
                    print(f"{line_default}|{line_file}")
                    exit(1)
                except IndexError:
                    pass

        print(f"{language}: {fails} out of {num_lines} lines are not translated.")
        result_list.append(
            (
                language,
                int((num_lines - fails) * 100 / num_lines),
            )
        )
    ignore_translation = convert_to_multiline(sort_ignore_translation)
    with open(ignore_translation_file, "w", encoding="utf-8", newline="\n") as file:
        file.write(tomlkit.dumps(ignore_translation))

    unique_data = list(set(result_list))
    unique_data.sort(key=lambda x: x[1], reverse=True)

    return unique_data


if __name__ == "__main__":
    directory = os.path.join(os.getcwd(), "src", "main", "resources")
    messages_file_paths = glob.glob(os.path.join(directory, "messages_*.properties"))
    reference_file = os.path.join(directory, "messages_en_GB.properties")

    scripts_directory = os.path.join(os.getcwd(), "scripts")
    translation_state_file = os.path.join(scripts_directory, "ignore_translation.toml")

    write_readme(
        compare_files(reference_file, messages_file_paths, translation_state_file)
    )



================================================
FILE: scripts/download-security-jar.sh
================================================
echo "Running Stirling PDF with DOCKER_ENABLE_SECURITY=${DOCKER_ENABLE_SECURITY} and VERSION_TAG=${VERSION_TAG}"
# Check for DOCKER_ENABLE_SECURITY and download the appropriate JAR if required
if [ "$DOCKER_ENABLE_SECURITY" = "true" ] && [ "$VERSION_TAG" != "alpha" ]; then
    if [ ! -f app-security.jar ]; then
        echo "Trying to download from: https://files.stirlingpdf.com/v$VERSION_TAG/Stirling-PDF-with-login.jar"
        curl -L -o app-security.jar https://files.stirlingpdf.com/v$VERSION_TAG/Stirling-PDF-with-login.jar

        # If the first download attempt failed, try without the 'v' prefix
        if [ $? -ne 0 ]; then
            echo "Trying to download from: https://files.stirlingpdf.com/$VERSION_TAG/Stirling-PDF-with-login.jar"
            curl -L -o app-security.jar https://files.stirlingpdf.com/$VERSION_TAG/Stirling-PDF-with-login.jar
        fi

        if [ $? -eq 0 ]; then  # checks if curl was successful
            rm -f app.jar
            ln -s app-security.jar app.jar
            chown stirlingpdfuser:stirlingpdfgroup app.jar || true
            chmod 755 app.jar || true
        fi
    fi
fi



================================================
FILE: scripts/ignore_translation.toml
================================================
[ar_AR]
ignore = [
    'language.direction',
]

[az_AZ]
ignore = [
    'language.direction',
]

[bg_BG]
ignore = [
    'language.direction',
]

[ca_CA]
ignore = [
    'PDFToText.tags',
    'adminUserSettings.admin',
    'language.direction',
    'watermark.type.1',
]

[cs_CZ]
ignore = [
    'language.direction',
    'text',
]

[da_DK]
ignore = [
    'language.direction',
]

[de_DE]
ignore = [
    'AddStampRequest.alphabet',
    'AddStampRequest.position',
    'PDFToBook.selectText.1',
    'PDFToText.tags',
    'addPageNumbers.selectText.3',
    'alphabet',
    'certSign.name',
    'fileChooser.dragAndDrop',
    'home.pipeline.title',
    'language.direction',
    'legal.impressum',
    'licenses.version',
    'pipeline.title',
    'pipelineOptions.pipelineHeader',
    'pro',
    'redact.zoom',
    'sponsor',
    'text',
    'validateSignature.cert.bits',
    'validateSignature.cert.version',
    'validateSignature.status',
    'watermark.type.1',
    'endpointStatistics.top10',
    'endpointStatistics.top20',
    'cookieBanner.popUp.acceptAllBtn',
]

[el_GR]
ignore = [
    'language.direction',
]

[es_ES]
ignore = [
    'adminUserSettings.roles',
    'error',
    'language.direction',
    'no',
    'showJS.tags',
]

[eu_ES]
ignore = [
    'language.direction',
]

[fa_IR]
ignore = [
    'language.direction',
]

[fr_FR]
ignore = [
    'AddStampRequest.alphabet',
    'AddStampRequest.position',
    'AddStampRequest.rotation',
    'PDFToBook.selectText.1',
    'addPageNumbers.selectText.3',
    'adminUserSettings.actions',
    'alphabet',
    'compare.document.1',
    'compare.document.2',
    'language.direction',
    'licenses.license',
    'licenses.module',
    'licenses.nav',
    'licenses.version',
    'pdfOrganiser.mode',
    'pipeline.title',
    'watermark.type.2',
]

[ga_IE]
ignore = [
    'language.direction',
]

[hi_IN]
ignore = [
    'language.direction',
]

[hr_HR]
ignore = [
    'PDFToBook.selectText.1',
    'home.pipeline.title',
    'language.direction',
    'showJS.tags',
]

[hu_HU]
ignore = [
    'language.direction',
]

[id_ID]
ignore = [
    'language.direction',
]

[it_IT]
ignore = [
    'language.direction',
    'no',
    'password',
    'pipeline.title',
    'pipelineOptions.pipelineHeader',
    'removePassword.selectText.2',
    'showJS.tags',
    'sponsor',
]

[ja_JP]
ignore = [
    'language.direction',
]

[ko_KR]
ignore = [
    'language.direction',
]

[nl_NL]
ignore = [
    'compare.document.1',
    'compare.document.2',
    'language.direction',
    'navbar.allTools',
    'sponsor',
]

[no_NB]
ignore = [
    'PDFToBook.selectText.1',
    'adminUserSettings.admin',
    'info',
    'language.direction',
    'oops',
    'sponsor',
]

[pl_PL]
ignore = [
    'PDFToBook.selectText.1',
    'language.direction',
]

[pt_BR]
ignore = [
    'language.direction',
    'pipelineOptions.pipelineHeader',
]

[pt_PT]
ignore = [
    'language.direction',
]

[ro_RO]
ignore = [
    'language.direction',
]

[ru_RU]
ignore = [
    'language.direction',
]

[sk_SK]
ignore = [
    'adminUserSettings.admin',
    'home.multiTool.title',
    'info',
    'language.direction',
    'navbar.sections.security',
    'text',
    'watermark.type.1',
]

[sl_SI]
ignore = [
    'language.direction',
]

[sr_LATN_RS]
ignore = [
    'language.direction',
    'licenses.version',
    'poweredBy',
]

[sv_SE]
ignore = [
    'language.direction',
]

[th_TH]
ignore = [
    'language.direction',
    'pipelineOptions.pipelineHeader',
    'showJS.tags',
]

[tr_TR]
ignore = [
    'language.direction',
]

[uk_UA]
ignore = [
    'language.direction',
]

[vi_VN]
ignore = [
    'language.direction',
    'pipeline.title',
    'pipelineOptions.pipelineHeader',
    'showJS.tags',
]

[zh_BO]
ignore = [
    'language.direction',
]

[zh_CN]
ignore = [
    'language.direction',
]

[zh_TW]
ignore = [
    'language.direction',
]



================================================
FILE: scripts/init-without-ocr.sh
================================================
#!/bin/bash

export JAVA_TOOL_OPTIONS="${JAVA_BASE_OPTS} ${JAVA_CUSTOM_OPTS}"
echo "running with JAVA_TOOL_OPTIONS ${JAVA_BASE_OPTS} ${JAVA_CUSTOM_OPTS}"

# Update the user and group IDs as per environment variables
if [ ! -z "$PUID" ] && [ "$PUID" != "$(id -u stirlingpdfuser)" ]; then
    usermod -o -u "$PUID" stirlingpdfuser || true
fi


if [ ! -z "$PGID" ] && [ "$PGID" != "$(getent group stirlingpdfgroup | cut -d: -f3)" ]; then
    groupmod -o -g "$PGID" stirlingpdfgroup || true
fi
umask "$UMASK" || true

if [[ "$INSTALL_BOOK_AND_ADVANCED_HTML_OPS" == "true" && "$FAT_DOCKER" != "true" ]]; then
  echo "issue with calibre in current version, feature currently disabled on Stirling-PDF"
  #apk add --no-cache calibre@testing
fi

if [[ "$FAT_DOCKER" != "true" ]]; then
  /scripts/download-security-jar.sh	
fi

if [[ -n "$LANGS" ]]; then
  /scripts/installFonts.sh $LANGS
fi

echo "Setting permissions and ownership for necessary directories..."
# Attempt to change ownership of directories and files
if chown -R stirlingpdfuser:stirlingpdfgroup $HOME /logs /scripts /usr/share/fonts/opentype/noto /configs /customFiles /pipeline /app.jar; then
	chmod -R 755 /logs /scripts /usr/share/fonts/opentype/noto /configs /customFiles /pipeline /app.jar || true
    # If chown succeeds, execute the command as stirlingpdfuser
    exec su-exec stirlingpdfuser "$@"
else
    # If chown fails, execute the command without changing the user context
    echo "[WARN] Chown failed, running as host user"
    exec "$@"
fi



================================================
FILE: scripts/init.sh
================================================
#!/bin/bash

# Copy the original tesseract-ocr files to the volume directory without overwriting existing files
echo "Copying original files without overwriting existing files"
mkdir -p /usr/share/tessdata
cp -rn /usr/share/tessdata-original/* /usr/share/tessdata

if [ -d /usr/share/tesseract-ocr/4.00/tessdata ]; then
        cp -r /usr/share/tesseract-ocr/4.00/tessdata/* /usr/share/tessdata || true;
fi

if [ -d /usr/share/tesseract-ocr/5/tessdata ]; then
        cp -r /usr/share/tesseract-ocr/5/tessdata/* /usr/share/tessdata || true;
fi

# Check if TESSERACT_LANGS environment variable is set and is not empty
if [[ -n "$TESSERACT_LANGS" ]]; then
  # Convert comma-separated values to a space-separated list
  SPACE_SEPARATED_LANGS=$(echo $TESSERACT_LANGS | tr ',' ' ')
  pattern='^[a-zA-Z]{2,4}(_[a-zA-Z]{2,4})?$'
  # Install each language pack
  for LANG in $SPACE_SEPARATED_LANGS; do
     if [[ $LANG =~ $pattern ]]; then
      apk add --no-cache "tesseract-ocr-data-$LANG"
     else
      echo "Skipping invalid language code"
     fi
  done
fi

/scripts/init-without-ocr.sh "$@"


================================================
FILE: scripts/installFonts.sh
================================================
#!/bin/bash

LANGS=$1

# Function to install a font package
install_font() {
    echo "Installing font package: $1"
    if ! apk add "$1" --no-cache; then
        echo "Failed to install $1"
    fi
}

# Install common fonts used across many languages
#common_fonts=(
#    font-terminus
#    font-dejavu
#    font-noto
#    font-noto-cjk
#    font-awesome
#    font-noto-extra
#)
#
#for font in "${common_fonts[@]}"; do
#    install_font $font
#done

# Map languages to specific font packages
declare -A language_fonts=(
    ["ar_AR"]="font-noto-arabic"
    ["zh_CN"]="font-isas-misc"
    ["zh_TW"]="font-isas-misc"
    ["ja_JP"]="font-noto font-noto-thai font-noto-tibetan font-ipa font-sony-misc font-jis-misc"
    ["ru_RU"]="font-vollkorn font-misc-cyrillic font-mutt-misc font-screen-cyrillic font-winitzki-cyrillic font-cronyx-cyrillic"
    ["sr_LATN_RS"]="font-vollkorn font-misc-cyrillic font-mutt-misc font-screen-cyrillic font-winitzki-cyrillic font-cronyx-cyrillic"
    ["uk_UA"]="font-vollkorn font-misc-cyrillic font-mutt-misc font-screen-cyrillic font-winitzki-cyrillic font-cronyx-cyrillic"
    ["ko_KR"]="font-noto font-noto-thai font-noto-tibetan"
    ["el_GR"]="font-noto"
    ["hi_IN"]="font-noto-devanagari"
    ["bg_BG"]="font-vollkorn font-misc-cyrillic"
    ["GENERAL"]="font-terminus font-dejavu font-noto font-noto-cjk font-awesome font-noto-extra"
)

# Install fonts for other languages which generally do not need special packages beyond 'font-noto'
other_langs=("en_GB" "en_US" "de_DE" "fr_FR" "es_ES" "ca_CA" "it_IT" "pt_BR" "nl_NL" "sv_SE" "pl_PL" "ro_RO" "hu_HU" "tr_TR" "id_ID" "eu_ES")
if [[ $LANGS == "ALL" ]]; then
    # Install all fonts from the language_fonts map
    for fonts in "${language_fonts[@]}"; do
        for font in $fonts; do
            install_font $font
        done
    done
else
    # Split comma-separated languages and install necessary fonts
    IFS=',' read -ra LANG_CODES <<< "$LANGS"
    for code in "${LANG_CODES[@]}"; do
        if [[ " ${other_langs[@]} " =~ " ${code} " ]]; then
            install_font font-noto
        else
            fonts_to_install=${language_fonts[$code]}
            if [ ! -z "$fonts_to_install" ]; then
                for font in $fonts_to_install; do
                    install_font $font
                done
            fi
        fi
    done
fi



================================================
FILE: scripts/png_to_webp.py
================================================
"""
Author: Ludy87
Description: This script converts a PDF file to WebP images. It includes functionality to resize images if they exceed specified dimensions and handle conversion of PDF pages to WebP format.

Example
-------
To convert a PDF file to WebP images with each page as a separate WebP file:
    python script.py input.pdf output_directory

To convert a PDF file to a single WebP image:
    python script.py input.pdf output_directory --single

To adjust the DPI resolution for rendering PDF pages:
    python script.py input.pdf output_directory --dpi 150
"""

import argparse
import os
from pdf2image import convert_from_path
from PIL import Image


def resize_image(input_image_path, output_image_path, max_size=(16383, 16383)):
    """
    Resize the image if its dimensions exceed the maximum allowed size and save it as WebP.

    Parameters
    ----------
    input_image_path : str
        Path to the input image file.
    output_image_path : str
        Path where the output WebP image will be saved.
    max_size : tuple of int, optional
        Maximum allowed dimensions for the image (width, height). Default is (16383, 16383).

    Returns
    -------
    None
    """
    try:
        # Open the image
        image = Image.open(input_image_path)
        width, height = image.size
        max_width, max_height = max_size

        # Check if the image dimensions exceed the maximum allowed dimensions
        if width > max_width or height > max_height:
            # Calculate the scaling ratio
            ratio = min(max_width / width, max_height / height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)

            # Resize the image
            resized_image = image.resize((new_width, new_height), Image.LANCZOS)
            resized_image.save(output_image_path, format="WEBP", quality=100)
            print(
                f"The image was successfully resized to ({new_width}, {new_height}) and saved as WebP: {output_image_path}"
            )
        else:
            # If dimensions are within the allowed limits, save the image directly
            image.save(output_image_path, format="WEBP", quality=100)
            print(f"The image was successfully saved as WebP: {output_image_path}")
    except Exception as e:
        print(f"An error occurred: {e}")


def convert_image_to_webp(input_image, output_file):
    """
    Convert an image to WebP format, resizing it if it exceeds the maximum dimensions.

    Parameters
    ----------
    input_image : str
        Path to the input image file.
    output_file : str
        Path where the output WebP image will be saved.

    Returns
    -------
    None
    """
    # Resize the image if it exceeds the maximum dimensions
    resize_image(input_image, output_file, max_size=(16383, 16383))


def pdf_to_webp(pdf_path, output_dir, dpi=300):
    """
    Convert each page of a PDF file to WebP images.

    Parameters
    ----------
    pdf_path : str
        Path to the input PDF file.
    output_dir : str
        Directory where the WebP images will be saved.
    dpi : int, optional
        DPI resolution for rendering PDF pages. Default is 300.

    Returns
    -------
    None
    """
    # Convert the PDF to a list of images
    images = convert_from_path(pdf_path, dpi=dpi)

    for page_number, image in enumerate(images):
        # Define temporary PNG path
        temp_png_path = os.path.join(output_dir, f"temp_page_{page_number + 1}.png")
        image.save(temp_png_path, format="PNG")

        # Define the output path for WebP
        output_path = os.path.join(output_dir, f"page_{page_number + 1}.webp")

        # Convert PNG to WebP
        convert_image_to_webp(temp_png_path, output_path)

        # Delete the temporary PNG file
        os.remove(temp_png_path)


def main(pdf_image_path, output_dir, dpi=300, single_images_flag=False):
    """
    Main function to handle conversion from PDF to WebP images.

    Parameters
    ----------
    pdf_image_path : str
        Path to the input PDF file or image.
    output_dir : str
        Directory where the WebP images will be saved.
    dpi : int, optional
        DPI resolution for rendering PDF pages. Default is 300.
    single_images_flag : bool, optional
        If True, combine all pages into a single WebP image. Default is False.

    Returns
    -------
    None
    """
    if single_images_flag:
        # Combine all pages into a single WebP image
        output_path = os.path.join(output_dir, "combined_image.webp")
        convert_image_to_webp(pdf_image_path, output_path)
    else:
        # Convert each PDF page to a separate WebP image
        pdf_to_webp(pdf_image_path, output_dir, dpi)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert a PDF file to WebP images.")
    parser.add_argument("pdf_path", help="The path to the input PDF file.")
    parser.add_argument(
        "output_dir", help="The directory where the WebP images should be saved."
    )
    parser.add_argument(
        "--dpi",
        type=int,
        default=300,
        help="The DPI resolution for rendering the PDF pages (default: 300).",
    )
    parser.add_argument(
        "--single",
        action="store_true",
        help="Combine all pages into a single WebP image.",
    )
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    main(
        args.pdf_path,
        args.output_dir,
        dpi=args.dpi,
        single_images_flag=args.single,
    )



================================================
FILE: scripts/PropSync.java
================================================
package stirling.software.Stirling.Stats;

import java.nio.file.*;
import java.nio.charset.MalformedInputException;
import java.nio.charset.StandardCharsets;
import java.io.*;
import java.util.*;

public class PropSync {

    public static void main(String[] args) throws IOException {
        File folder = new File("C:\\Users\\systo\\git\\Stirling-PDF\\src\\main\\resources");
        File[] files = folder.listFiles((dir, name) -> name.matches("messages_.*\\.properties"));

        List<String> enLines = Files.readAllLines(Paths.get(folder + "\\messages_en_GB.properties"), StandardCharsets.UTF_8);
        Map<String, String> enProps = linesToProps(enLines);

        for (File file : files) {
            if (!"messages_en_GB.properties".equals(file.getName())) {
                System.out.println("Processing file: " + file.getName());
                List<String> lines;
                try {
                    lines = Files.readAllLines(file.toPath(), StandardCharsets.UTF_8);
                } catch (MalformedInputException e) {
                    System.out.println("Skipping due to not UTF8 format for file: " + file.getName());
                    continue;
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }

                Map<String, String> currentProps = linesToProps(lines);
                List<String> newLines = syncPropsWithLines(enProps, currentProps, enLines);

                Files.write(file.toPath(), newLines, StandardCharsets.UTF_8);
                System.out.println("Finished processing file: " + file.getName());
            }
        }
    }

    private static Map<String, String> linesToProps(List<String> lines) {
        Map<String, String> props = new LinkedHashMap<>();
        for (String line : lines) {
            if (!line.trim().isEmpty() && line.contains("=")) {
                String[] parts = line.split("=", 2);
                props.put(parts[0].trim(), parts[1].trim());
            }
        }
        return props;
    }

    private static List<String> syncPropsWithLines(Map<String, String> enProps, Map<String, String> currentProps, List<String> enLines) {
        List<String> newLines = new ArrayList<>();
        boolean needsTranslateComment = false; // flag to check if we need to add "TODO: Translate"

        for (String line : enLines) {
            if (line.contains("=")) {
                String key = line.split("=", 2)[0].trim();

                if (currentProps.containsKey(key)) {
                    newLines.add(key + "=" + currentProps.get(key));
                    needsTranslateComment = false;
                } else {
                    if (!needsTranslateComment) {
                        newLines.add("##########################");
                        newLines.add("###  TODO: Translate   ###");
                        newLines.add("##########################");
                        needsTranslateComment = true;
                    }
                    newLines.add(line);
                }
            } else {
                // handle comments and other non-property lines
                newLines.add(line);
                needsTranslateComment = false;  // reset the flag when we encounter comments or empty lines
            }
        }

        return newLines;
    }
}



================================================
FILE: scripts/remove_translation_keys.sh
================================================
#!/bin/bash

# Check if a key was provided
if [ $# -eq 0 ]; then
    echo "Please provide a key to remove."
    exit 1
fi

key_to_remove="$1"

for file in ../src/main/resources/messages_*.properties; do
    # If the key ends with a dot, remove all keys starting with it
    if [[ "$key_to_remove" == *. ]]; then
        sed -i "/^${key_to_remove//./\\.}/d" "$file"
    else
        # Otherwise, remove only the exact key match
        sed -i "/^${key_to_remove//./\\.}=/d" "$file"
    fi
    echo "Updated $file"
done


================================================
FILE: scripts/replace_translation_line.sh
================================================
#!/bin/bash

translation_key="pdfToPDFA.credit"
old_value="qpdf"
new_value="liibreoffice"

for file in ../src/main/resources/messages_*.properties; do
  sed -i "/^$translation_key=/s/$old_value/$new_value/" "$file"
  echo "Updated $file"
done



================================================
FILE: scripts/split_photos.py
================================================
import argparse
import sys
import cv2
import numpy as np
import os

def find_photo_boundaries(image, background_color, tolerance=30, min_area=10000, min_contour_area=500):
    mask = cv2.inRange(image, background_color - tolerance, background_color + tolerance)
    mask = cv2.bitwise_not(mask)
    kernel = np.ones((5,5),np.uint8)
    mask = cv2.dilate(mask, kernel, iterations=2)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    photo_boundaries = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        area = w * h
        contour_area = cv2.contourArea(contour)
        if area >= min_area and contour_area >= min_contour_area:
            photo_boundaries.append((x, y, w, h))

    return photo_boundaries

def estimate_background_color(image, sample_points=5):
    h, w, _ = image.shape
    points = [
        (0, 0),
        (w - 1, 0),
        (w - 1, h - 1),
        (0, h - 1),
        (w // 2, h // 2),
    ]

    colors = []
    for x, y in points:
        colors.append(image[y, x])

    return np.median(colors, axis=0)

def auto_rotate(image, angle_threshold=1):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)

    if lines is None:
        return image

    # compute the median angle of the lines
    angles = []
    for rho, theta in lines[:, 0]:
        angles.append((theta * 180) / np.pi - 90)

    angle = np.median(angles)

    if abs(angle) < angle_threshold:
        return image

    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)




def crop_borders(image, border_color, tolerance=30):
    mask = cv2.inRange(image, border_color - tolerance, border_color + tolerance)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if len(contours) == 0:
        return image

    largest_contour = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest_contour)

    return image[y:y+h, x:x+w]

def split_photos(input_file, output_directory, tolerance=30, min_area=10000, min_contour_area=500, angle_threshold=10, border_size=0):
    image = cv2.imread(input_file)
    background_color = estimate_background_color(image)

    # Add a constant border around the image
    image = cv2.copyMakeBorder(image, border_size, border_size, border_size, border_size, cv2.BORDER_CONSTANT, value=background_color)

    photo_boundaries = find_photo_boundaries(image, background_color, tolerance)

    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    # Get the input file's base name without the extension
    input_file_basename = os.path.splitext(os.path.basename(input_file))[0]

    for idx, (x, y, w, h) in enumerate(photo_boundaries):
        cropped_image = image[y:y+h, x:x+w]
        cropped_image = auto_rotate(cropped_image, angle_threshold)

        # Remove the added border
        cropped_image = cropped_image[border_size:-border_size, border_size:-border_size]

        output_path = os.path.join(output_directory, f"{input_file_basename}_{idx+1}.png")
        cv2.imwrite(output_path, cropped_image)
        print(f"Saved {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Split photos in an image")
    parser.add_argument("input_file", help="The input scanned image containing multiple photos.")
    parser.add_argument("output_directory", help="The directory where the result images should be placed.")
    parser.add_argument("--tolerance", type=int, default=30, help="Determines the range of color variation around the estimated background color (default: 30).")
    parser.add_argument("--min_area", type=int, default=10000, help="Sets the minimum area threshold for a photo (default: 10000).")
    parser.add_argument("--min_contour_area", type=int, default=500, help="Sets the minimum contour area threshold for a photo (default: 500).")
    parser.add_argument("--angle_threshold", type=int, default=10, help="Sets the minimum absolute angle required for the image to be rotated (default: 10).")
    parser.add_argument("--border_size", type=int, default=0, help="Sets the size of the border added and removed to prevent white borders in the output (default: 0).")

    args = parser.parse_args()

    split_photos(args.input_file, args.output_directory, tolerance=args.tolerance, min_area=args.min_area, min_contour_area=args.min_contour_area, angle_threshold=args.angle_threshold, border_size=args.border_size)



================================================
FILE: src/main/java/org/apache/pdfbox/examples/signature/CMSProcessableInputStream.java
================================================
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.pdfbox.examples.signature;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.bouncycastle.asn1.ASN1ObjectIdentifier;
import org.bouncycastle.asn1.cms.CMSObjectIdentifiers;
import org.bouncycastle.cms.CMSException;
import org.bouncycastle.cms.CMSTypedData;

/**
 * Wraps a InputStream into a CMSProcessable object for bouncy castle. It's a memory saving
 * alternative to the {@link org.bouncycastle.cms.CMSProcessableByteArray CMSProcessableByteArray}
 * class.
 *
 * @author Thomas Chojecki
 */
class CMSProcessableInputStream implements CMSTypedData {
    private final InputStream in;
    private final ASN1ObjectIdentifier contentType;

    CMSProcessableInputStream(InputStream is) {
        this(new ASN1ObjectIdentifier(CMSObjectIdentifiers.data.getId()), is);
    }

    CMSProcessableInputStream(ASN1ObjectIdentifier type, InputStream is) {
        contentType = type;
        in = is;
    }

    @Override
    public Object getContent() {
        return in;
    }

    @Override
    public void write(OutputStream out) throws IOException, CMSException {
        // read the content only one time
        in.transferTo(out);
        in.close();
    }

    @Override
    public ASN1ObjectIdentifier getContentType() {
        return contentType;
    }
}



================================================
FILE: src/main/java/org/apache/pdfbox/examples/signature/CreateSignatureBase.java
================================================
/*
 * Copyright 2015 The Apache Software Foundation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.pdfbox.examples.signature;

import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.UnrecoverableKeyException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Arrays;
import java.util.Enumeration;

import org.apache.pdfbox.pdmodel.interactive.digitalsignature.SignatureInterface;
import org.bouncycastle.cert.jcajce.JcaCertStore;
import org.bouncycastle.cms.CMSException;
import org.bouncycastle.cms.CMSSignedData;
import org.bouncycastle.cms.CMSSignedDataGenerator;
import org.bouncycastle.cms.jcajce.JcaSignerInfoGeneratorBuilder;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.OperatorCreationException;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.operator.jcajce.JcaDigestCalculatorProviderBuilder;

public abstract class CreateSignatureBase implements SignatureInterface {
    private PrivateKey privateKey;
    private Certificate[] certificateChain;
    private String tsaUrl;
    private boolean externalSigning;

    /**
     * Initialize the signature creator with a keystore (pkcs12) and pin that should be used for the
     * signature.
     *
     * @param keystore is a pkcs12 keystore.
     * @param pin is the pin for the keystore / private key
     * @throws KeyStoreException if the keystore has not been initialized (loaded)
     * @throws NoSuchAlgorithmException if the algorithm for recovering the key cannot be found
     * @throws UnrecoverableKeyException if the given password is wrong
     * @throws CertificateException if the certificate is not valid as signing time
     * @throws IOException if no certificate could be found
     */
    public CreateSignatureBase(KeyStore keystore, char[] pin)
            throws KeyStoreException,
                    UnrecoverableKeyException,
                    NoSuchAlgorithmException,
                    IOException,
                    CertificateException {
        // grabs the first alias from the keystore and get the private key. An
        // alternative method or constructor could be used for setting a specific
        // alias that should be used.
        Enumeration<String> aliases = keystore.aliases();
        String alias;
        Certificate cert = null;
        while (cert == null && aliases.hasMoreElements()) {
            alias = aliases.nextElement();
            setPrivateKey((PrivateKey) keystore.getKey(alias, pin));
            Certificate[] certChain = keystore.getCertificateChain(alias);
            if (certChain != null) {
                setCertificateChain(certChain);
                cert = certChain[0];
                if (cert instanceof X509Certificate) {
                    // avoid expired certificate
                    ((X509Certificate) cert).checkValidity();

                    //// SigUtils.checkCertificateUsage((X509Certificate) cert);
                }
            }
        }

        if (cert == null) {
            throw new IOException("Could not find certificate");
        }
    }

    public final void setPrivateKey(PrivateKey privateKey) {
        this.privateKey = privateKey;
    }

    public Certificate[] getCertificateChain() {
        return certificateChain;
    }

    public final void setCertificateChain(final Certificate[] certificateChain) {
        this.certificateChain = certificateChain;
    }

    public void setTsaUrl(String tsaUrl) {
        this.tsaUrl = tsaUrl;
    }

    /**
     * SignatureInterface sample implementation.
     *
     * <p>This method will be called from inside of the pdfbox and create the PKCS #7 signature. The
     * given InputStream contains the bytes that are given by the byte range.
     *
     * <p>This method is for internal use only.
     *
     * <p>Use your favorite cryptographic library to implement PKCS #7 signature creation. If you
     * want to create the hash and the signature separately (e.g. to transfer only the hash to an
     * external application), read <a href="https://stackoverflow.com/questions/41767351">this
     * answer</a> or <a href="https://stackoverflow.com/questions/56867465">this answer</a>.
     *
     * @throws IOException
     */
    @Override
    public byte[] sign(InputStream content) throws IOException {
        // cannot be done private (interface)
        try {
            CMSSignedDataGenerator gen = new CMSSignedDataGenerator();
            X509Certificate cert = (X509Certificate) certificateChain[0];
            ContentSigner sha1Signer =
                    new JcaContentSignerBuilder("SHA256WithRSA").build(privateKey);
            gen.addSignerInfoGenerator(
                    new JcaSignerInfoGeneratorBuilder(
                                    new JcaDigestCalculatorProviderBuilder().build())
                            .build(sha1Signer, cert));
            gen.addCertificates(new JcaCertStore(Arrays.asList(certificateChain)));
            CMSProcessableInputStream msg = new CMSProcessableInputStream(content);
            CMSSignedData signedData = gen.generate(msg, false);
            if (tsaUrl != null && !tsaUrl.isEmpty()) {
                ValidationTimeStamp validation = new ValidationTimeStamp(tsaUrl);
                signedData = validation.addSignedTimeStamp(signedData);
            }
            return signedData.getEncoded();
        } catch (GeneralSecurityException
                | CMSException
                | OperatorCreationException
                | URISyntaxException e) {
            throw new IOException(e);
        }
    }

    public boolean isExternalSigning() {
        return externalSigning;
    }

    /**
     * Set if external signing scenario should be used. If {@code false}, SignatureInterface would
     * be used for signing.
     *
     * <p>Default: {@code false}
     *
     * @param externalSigning {@code true} if external signing should be performed
     */
    public void setExternalSigning(boolean externalSigning) {
        this.externalSigning = externalSigning;
    }
}



================================================
FILE: src/main/java/org/apache/pdfbox/examples/signature/TSAClient.java
================================================
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.pdfbox.examples.signature;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.math.BigInteger;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Random;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.bouncycastle.asn1.ASN1ObjectIdentifier;
import org.bouncycastle.operator.DefaultDigestAlgorithmIdentifierFinder;
import org.bouncycastle.operator.DigestAlgorithmIdentifierFinder;
import org.bouncycastle.tsp.TSPException;
import org.bouncycastle.tsp.TimeStampRequest;
import org.bouncycastle.tsp.TimeStampRequestGenerator;
import org.bouncycastle.tsp.TimeStampResponse;
import org.bouncycastle.tsp.TimeStampToken;

/**
 * Time Stamping Authority (TSA) Client [RFC 3161].
 *
 * @author Vakhtang Koroghlishvili
 * @author John Hewson
 */
public class TSAClient {
    private static final Logger LOG = LogManager.getLogger(TSAClient.class);

    private static final DigestAlgorithmIdentifierFinder ALGORITHM_OID_FINDER =
            new DefaultDigestAlgorithmIdentifierFinder();
    // SecureRandom.getInstanceStrong() would be better, but sometimes blocks on Linux
    private static final Random RANDOM = new SecureRandom();
    private final URL url;
    private final String username;
    private final String password;
    private final MessageDigest digest;

    /**
     * @param url the URL of the TSA service
     * @param username user name of TSA
     * @param password password of TSA
     * @param digest the message digest to use
     */
    public TSAClient(URL url, String username, String password, MessageDigest digest) {
        this.url = url;
        this.username = username;
        this.password = password;
        this.digest = digest;
    }

    /**
     * @param content
     * @return the time stamp token
     * @throws IOException if there was an error with the connection or data from the TSA server, or
     *     if the time stamp response could not be validated
     */
    public TimeStampToken getTimeStampToken(InputStream content) throws IOException {
        digest.reset();
        DigestInputStream dis = new DigestInputStream(content, digest);
        while (dis.read() != -1) {
            // do nothing
        }
        byte[] hash = digest.digest();

        // 32-bit cryptographic nonce
        int nonce = RANDOM.nextInt();

        // generate TSA request
        TimeStampRequestGenerator tsaGenerator = new TimeStampRequestGenerator();
        tsaGenerator.setCertReq(true);
        ASN1ObjectIdentifier oid = ALGORITHM_OID_FINDER.find(digest.getAlgorithm()).getAlgorithm();
        TimeStampRequest request = tsaGenerator.generate(oid, hash, BigInteger.valueOf(nonce));

        // get TSA response
        byte[] tsaResponse = getTSAResponse(request.getEncoded());

        TimeStampResponse response;
        try {
            response = new TimeStampResponse(tsaResponse);
            response.validate(request);
        } catch (TSPException e) {
            throw new IOException(e);
        }

        TimeStampToken timeStampToken = response.getTimeStampToken();
        if (timeStampToken == null) {
            // https://www.ietf.org/rfc/rfc3161.html#section-2.4.2
            throw new IOException(
                    "Response from "
                            + url
                            + " does not have a time stamp token, status: "
                            + response.getStatus()
                            + " ("
                            + response.getStatusString()
                            + ")");
        }

        return timeStampToken;
    }

    // gets response data for the given encoded TimeStampRequest data
    // throws IOException if a connection to the TSA cannot be established
    private byte[] getTSAResponse(byte[] request) throws IOException {
        LOG.debug("Opening connection to TSA server");

        // todo: support proxy servers
        URLConnection connection = url.openConnection();
        connection.setDoOutput(true);
        connection.setDoInput(true);
        connection.setRequestProperty("Content-Type", "application/timestamp-query");

        LOG.debug("Established connection to TSA server");

        if (username != null && password != null && !username.isEmpty() && !password.isEmpty()) {
            String contentEncoding = connection.getContentEncoding();
            if (contentEncoding == null) {
                contentEncoding = StandardCharsets.UTF_8.name();
            }
            connection.setRequestProperty(
                    "Authorization",
                    "Basic "
                            + new String(
                                    Base64.getEncoder()
                                            .encode(
                                                    (username + ":" + password)
                                                            .getBytes(contentEncoding))));
        }

        // read response
        try (OutputStream output = connection.getOutputStream()) {
            output.write(request);
        } catch (IOException ex) {
            LOG.error("Exception when writing to {}", this.url, ex);
            throw ex;
        }

        LOG.debug("Waiting for response from TSA server");

        byte[] response;
        try (InputStream input = connection.getInputStream()) {
            response = input.readAllBytes();
        } catch (IOException ex) {
            LOG.error("Exception when reading from {}", this.url, ex);
            throw ex;
        }

        LOG.debug("Received response from TSA server");

        return response;
    }
}



================================================
FILE: src/main/java/org/apache/pdfbox/examples/signature/ValidationTimeStamp.java
================================================
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.pdfbox.examples.signature;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

import org.bouncycastle.asn1.ASN1Encodable;
import org.bouncycastle.asn1.ASN1EncodableVector;
import org.bouncycastle.asn1.ASN1ObjectIdentifier;
import org.bouncycastle.asn1.ASN1Primitive;
import org.bouncycastle.asn1.DERSet;
import org.bouncycastle.asn1.cms.Attribute;
import org.bouncycastle.asn1.cms.AttributeTable;
import org.bouncycastle.asn1.cms.Attributes;
import org.bouncycastle.asn1.pkcs.PKCSObjectIdentifiers;
import org.bouncycastle.cms.CMSSignedData;
import org.bouncycastle.cms.SignerInformation;
import org.bouncycastle.cms.SignerInformationStore;
import org.bouncycastle.tsp.TimeStampToken;

/**
 * This class wraps the TSAClient and the work that has to be done with it. Like Adding Signed
 * TimeStamps to a signature, or creating a CMS timestamp attribute (with a signed timestamp)
 *
 * @author Others
 * @author Alexis Suter
 */
public class ValidationTimeStamp {
    private TSAClient tsaClient;

    /**
     * @param tsaUrl The url where TS-Request will be done.
     * @throws NoSuchAlgorithmException
     * @throws MalformedURLException
     * @throws java.net.URISyntaxException
     */
    public ValidationTimeStamp(String tsaUrl)
            throws NoSuchAlgorithmException, MalformedURLException, URISyntaxException {
        if (tsaUrl != null) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            this.tsaClient = new TSAClient(new URI(tsaUrl).toURL(), null, null, digest);
        }
    }

    /**
     * Creates a signed timestamp token by the given input stream.
     *
     * @param content InputStream of the content to sign
     * @return the byte[] of the timestamp token
     * @throws IOException
     */
    public byte[] getTimeStampToken(InputStream content) throws IOException {
        TimeStampToken timeStampToken = tsaClient.getTimeStampToken(content);
        return timeStampToken.getEncoded();
    }

    /**
     * Extend cms signed data with TimeStamp first or to all signers
     *
     * @param signedData Generated CMS signed data
     * @return CMSSignedData Extended CMS signed data
     * @throws IOException
     */
    public CMSSignedData addSignedTimeStamp(CMSSignedData signedData) throws IOException {
        SignerInformationStore signerStore = signedData.getSignerInfos();
        List<SignerInformation> newSigners = new ArrayList<>();

        for (SignerInformation signer : signerStore.getSigners()) {
            // This adds a timestamp to every signer (into his unsigned attributes) in the
            // signature.
            newSigners.add(signTimeStamp(signer));
        }

        // Because new SignerInformation is created, new SignerInfoStore has to be created
        // and also be replaced in signedData. Which creates a new signedData object.
        return CMSSignedData.replaceSigners(signedData, new SignerInformationStore(newSigners));
    }

    /**
     * Extend CMS Signer Information with the TimeStampToken into the unsigned Attributes.
     *
     * @param signer information about signer
     * @return information about SignerInformation
     * @throws IOException
     */
    private SignerInformation signTimeStamp(SignerInformation signer) throws IOException {
        AttributeTable unsignedAttributes = signer.getUnsignedAttributes();

        ASN1EncodableVector vector = new ASN1EncodableVector();
        if (unsignedAttributes != null) {
            vector = unsignedAttributes.toASN1EncodableVector();
        }

        TimeStampToken timeStampToken =
                tsaClient.getTimeStampToken(new ByteArrayInputStream(signer.getSignature()));
        byte[] token = timeStampToken.getEncoded();
        ASN1ObjectIdentifier oid = PKCSObjectIdentifiers.id_aa_signatureTimeStampToken;
        ASN1Encodable signatureTimeStamp =
                new Attribute(oid, new DERSet(ASN1Primitive.fromByteArray(token)));

        vector.add(signatureTimeStamp);
        Attributes signedAttributes = new Attributes(vector);

        // There is no other way changing the unsigned attributes of the signer information.
        // result is never null, new SignerInformation always returned,
        // see source code of replaceUnsignedAttributes
        return SignerInformation.replaceUnsignedAttributes(
                signer, new AttributeTable(signedAttributes));
    }
}



================================================
FILE: src/main/java/org/apache/pdfbox/examples/util/ConnectedInputStream.java
================================================
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.pdfbox.examples.util;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;

/**
 * Delegate class to close the connection when the class gets closed.
 *
 * @author Tilman Hausherr
 */
public class ConnectedInputStream extends InputStream {
    HttpURLConnection con;
    InputStream is;

    public ConnectedInputStream(HttpURLConnection con, InputStream is) {
        this.con = con;
        this.is = is;
    }

    @Override
    public int read() throws IOException {
        return is.read();
    }

    @Override
    public int read(byte[] b) throws IOException {
        return is.read(b);
    }

    @Override
    public int read(byte[] b, int off, int len) throws IOException {
        return is.read(b, off, len);
    }

    @Override
    public long skip(long n) throws IOException {
        return is.skip(n);
    }

    @Override
    public int available() throws IOException {
        return is.available();
    }

    @Override
    public synchronized void mark(int readlimit) {
        is.mark(readlimit);
    }

    @Override
    public synchronized void reset() throws IOException {
        is.reset();
    }

    @Override
    public boolean markSupported() {
        return is.markSupported();
    }

    @Override
    public void close() throws IOException {
        is.close();
        con.disconnect();
    }
}



================================================
FILE: src/main/java/org/apache/pdfbox/examples/util/DeletingRandomAccessFile.java
================================================
package org.apache.pdfbox.examples.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.apache.pdfbox.io.RandomAccessReadBufferedFile;

import lombok.extern.slf4j.Slf4j;

/** A custom RandomAccessRead implementation that deletes the file when closed */
@Slf4j
public class DeletingRandomAccessFile extends RandomAccessReadBufferedFile {
    private final Path tempFilePath;

    public DeletingRandomAccessFile(File file) throws IOException {
        super(file);
        this.tempFilePath = file.toPath();
    }

    @Override
    public void close() throws IOException {
        try {
            super.close();
        } finally {
            try {
                boolean deleted = Files.deleteIfExists(tempFilePath);
                if (deleted) {
                    log.info("Successfully deleted temp file: {}", tempFilePath);
                } else {
                    log.warn("Failed to delete temp file (may not exist): {}", tempFilePath);
                }
            } catch (IOException e) {
                log.error("Error deleting temp file: {}", tempFilePath, e);
            }
        }
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/LibreOfficeListener.java
================================================
package stirling.software.SPDF;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.github.pixee.security.SystemCommand;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class LibreOfficeListener {

    private static final long ACTIVITY_TIMEOUT = 20L * 60 * 1000; // 20 minutes

    private static final LibreOfficeListener INSTANCE = new LibreOfficeListener();
    private static final int LISTENER_PORT = 2002;
    private ExecutorService executorService;
    private long lastActivityTime;
    private Process process;

    private LibreOfficeListener() {}

    public static LibreOfficeListener getInstance() {
        return INSTANCE;
    }

    private boolean isListenerRunning() {
        log.info("waiting for listener to start");
        try (Socket socket = new Socket()) {
            socket.connect(
                    new InetSocketAddress("localhost", 2002), 1000); // Timeout after 1 second
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public void start() throws IOException {
        // Check if the listener is already running
        if (process != null && process.isAlive()) {
            return;
        }

        // Start the listener process
        process = SystemCommand.runCommand(Runtime.getRuntime(), "unoconv --listener");
        lastActivityTime = System.currentTimeMillis();

        // Start a background thread to monitor the activity timeout
        executorService = Executors.newSingleThreadExecutor();
        executorService.submit(
                () -> {
                    while (true) {
                        long idleTime = System.currentTimeMillis() - lastActivityTime;
                        if (idleTime >= ACTIVITY_TIMEOUT) {
                            // If there has been no activity for too long, tear down the listener
                            process.destroy();
                            break;
                        }
                        try {
                            Thread.sleep(5000); // Check for inactivity every 5 seconds
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                });

        // Wait for the listener to start up
        long startTime = System.currentTimeMillis();
        long timeout = 30000; // Timeout after 30 seconds
        while (System.currentTimeMillis() - startTime < timeout) {
            if (isListenerRunning()) {

                lastActivityTime = System.currentTimeMillis();
                return;
            }
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("exception", e);
            } // Check every 1 second
        }
    }

    public synchronized void stop() {
        // Stop the activity timeout monitor thread
        executorService.shutdownNow();

        // Stop the listener process
        if (process != null && process.isAlive()) {
            process.destroy();
        }
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/SPDFApplication.java
================================================
package stirling.software.SPDF;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.pixee.security.SystemCommand;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import lombok.extern.slf4j.Slf4j;

import stirling.software.SPDF.UI.WebBrowser;
import stirling.software.SPDF.config.ConfigInitializer;
import stirling.software.SPDF.config.InstallationPathConfig;
import stirling.software.SPDF.model.ApplicationProperties;
import stirling.software.SPDF.utils.UrlUtils;

@Slf4j
@EnableScheduling
@SpringBootApplication
public class SPDFApplication {

    private static String serverPortStatic;
    private static String baseUrlStatic;
    private static String contextPathStatic;

    private final Environment env;
    private final ApplicationProperties applicationProperties;
    private final WebBrowser webBrowser;

    @Value("${baseUrl:http://localhost}")
    private String baseUrl;

    @Value("${server.servlet.context-path:/}")
    private String contextPath;

    public SPDFApplication(
            Environment env,
            ApplicationProperties applicationProperties,
            @Autowired(required = false) WebBrowser webBrowser) {
        this.env = env;
        this.applicationProperties = applicationProperties;
        this.webBrowser = webBrowser;
    }

    public static void main(String[] args) throws IOException, InterruptedException {
        SpringApplication app = new SpringApplication(SPDFApplication.class);

        Properties props = new Properties();

        if (Boolean.parseBoolean(System.getProperty("STIRLING_PDF_DESKTOP_UI", "false"))) {
            System.setProperty("java.awt.headless", "false");
            app.setHeadless(false);
            props.put("java.awt.headless", "false");
            props.put("spring.main.web-application-type", "servlet");

            int desiredPort = 8080;
            String port = UrlUtils.findAvailablePort(desiredPort);
            props.put("server.port", port);
            System.setProperty("server.port", port);
            log.info("Desktop UI mode: Using port {}", port);
        }

        app.setAdditionalProfiles(getActiveProfile(args));

        ConfigInitializer initializer = new ConfigInitializer();
        try {
            initializer.ensureConfigExists();
        } catch (IOException | URISyntaxException e) {
            log.error("Error initialising configuration", e);
        }
        Map<String, String> propertyFiles = new HashMap<>();

        // External config files
        Path settingsPath = Paths.get(InstallationPathConfig.getSettingsPath());
        log.info("Settings file: {}", settingsPath.toString());
        if (Files.exists(settingsPath)) {
            propertyFiles.put(
                    "spring.config.additional-location", "file:" + settingsPath.toString());
        } else {
            log.warn("External configuration file '{}' does not exist.", settingsPath.toString());
        }

        Path customSettingsPath = Paths.get(InstallationPathConfig.getCustomSettingsPath());
        log.info("Custom settings file: {}", customSettingsPath.toString());
        if (Files.exists(customSettingsPath)) {
            String existingLocation =
                    propertyFiles.getOrDefault("spring.config.additional-location", "");
            if (!existingLocation.isEmpty()) {
                existingLocation += ",";
            }
            propertyFiles.put(
                    "spring.config.additional-location",
                    existingLocation + "file:" + customSettingsPath.toString());
        } else {
            log.warn(
                    "Custom configuration file '{}' does not exist.",
                    customSettingsPath.toString());
        }
        Properties finalProps = new Properties();

        if (!propertyFiles.isEmpty()) {
            finalProps.putAll(
                    Collections.singletonMap(
                            "spring.config.additional-location",
                            propertyFiles.get("spring.config.additional-location")));
        }

        if (!props.isEmpty()) {
            finalProps.putAll(props);
        }
        app.setDefaultProperties(finalProps);

        app.run(args);

        // Ensure directories are created
        try {
            Files.createDirectories(Path.of(InstallationPathConfig.getTemplatesPath()));
            Files.createDirectories(Path.of(InstallationPathConfig.getStaticPath()));
        } catch (IOException e) {
            log.error("Error creating directories: {}", e.getMessage());
        }

        printStartupLogs();
    }

    @PostConstruct
    public void init() {
        baseUrlStatic = this.baseUrl;
        contextPathStatic = this.contextPath;
        String url = baseUrl + ":" + getStaticPort() + contextPath;
        if (webBrowser != null
                && Boolean.parseBoolean(System.getProperty("STIRLING_PDF_DESKTOP_UI", "false"))) {
            webBrowser.initWebUI(url);
        } else {
            String browserOpenEnv = env.getProperty("BROWSER_OPEN");
            boolean browserOpen = browserOpenEnv != null && "true".equalsIgnoreCase(browserOpenEnv);
            if (browserOpen) {
                try {
                    String os = System.getProperty("os.name").toLowerCase();
                    Runtime rt = Runtime.getRuntime();
                    if (os.contains("win")) {
                        // For Windows
                        SystemCommand.runCommand(rt, "rundll32 url.dll,FileProtocolHandler " + url);
                    } else if (os.contains("mac")) {
                        SystemCommand.runCommand(rt, "open " + url);
                    } else if (os.contains("nix") || os.contains("nux")) {
                        SystemCommand.runCommand(rt, "xdg-open " + url);
                    }
                } catch (IOException e) {
                    log.error("Error opening browser: {}", e.getMessage());
                }
            }
        }
        log.info("Running configs {}", applicationProperties.toString());
    }

    @Value("${server.port:8080}")
    public void setServerPort(String port) {
        if ("auto".equalsIgnoreCase(port)) {
            // Use Spring Boot's automatic port assignment (server.port=0)
            SPDFApplication.serverPortStatic =
                    "0"; // This will let Spring Boot assign an available port
        } else {
            SPDFApplication.serverPortStatic = port;
        }
    }

    public static void setServerPortStatic(String port) {
        if ("auto".equalsIgnoreCase(port)) {
            // Use Spring Boot's automatic port assignment (server.port=0)
            SPDFApplication.serverPortStatic =
                    "0"; // This will let Spring Boot assign an available port
        } else {
            SPDFApplication.serverPortStatic = port;
        }
    }

    @PreDestroy
    public void cleanup() {
        if (webBrowser != null) {
            webBrowser.cleanup();
        }
    }

    private static void printStartupLogs() {
        log.info("Stirling-PDF Started.");
        String url = baseUrlStatic + ":" + getStaticPort() + contextPathStatic;
        log.info("Navigate to {}", url);
    }

    private static String[] getActiveProfile(String[] args) {
        if (args == null) {
            return new String[] {"default"};
        }

        for (String arg : args) {
            if (arg.contains("spring.profiles.active")) {
                return arg.substring(args[0].indexOf('=') + 1).split(", ");
            }
        }

        return new String[] {"default"};
    }

    public static String getStaticBaseUrl() {
        return baseUrlStatic;
    }

    public static String getStaticPort() {
        return serverPortStatic;
    }

    public static String getStaticContextPath() {
        return contextPathStatic;
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/AppConfig.java
================================================
package stirling.software.SPDF.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Properties;
import java.util.function.Predicate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Scope;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.thymeleaf.spring6.SpringTemplateEngine;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import stirling.software.SPDF.model.ApplicationProperties;

@Configuration
@Lazy
@Slf4j
@RequiredArgsConstructor
public class AppConfig {

    private final ApplicationProperties applicationProperties;

    @Bean
    @ConditionalOnProperty(name = "system.customHTMLFiles", havingValue = "true")
    public SpringTemplateEngine templateEngine(ResourceLoader resourceLoader) {
        SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        templateEngine.addTemplateResolver(new FileFallbackTemplateResolver(resourceLoader));
        return templateEngine;
    }

    @Bean(name = "loginEnabled")
    public boolean loginEnabled() {
        return applicationProperties.getSecurity().getEnableLogin();
    }

    @Bean(name = "appName")
    public String appName() {
        String homeTitle = applicationProperties.getUi().getAppName();
        return (homeTitle != null) ? homeTitle : "Stirling PDF";
    }

    @Bean(name = "appVersion")
    public String appVersion() {
        Resource resource = new ClassPathResource("version.properties");
        Properties props = new Properties();
        try {
            props.load(resource.getInputStream());
            return props.getProperty("version");
        } catch (IOException e) {
            log.error("exception", e);
        }
        return "0.0.0";
    }

    @Bean(name = "homeText")
    public String homeText() {
        return (applicationProperties.getUi().getHomeDescription() != null)
                ? applicationProperties.getUi().getHomeDescription()
                : "null";
    }

    @Bean(name = "languages")
    public List<String> languages() {
        return applicationProperties.getUi().getLanguages();
    }

    @Bean
    public String contextPath(@Value("${server.servlet.context-path}") String contextPath) {
        return contextPath;
    }

    @Bean(name = "navBarText")
    public String navBarText() {
        String defaultNavBar =
                applicationProperties.getUi().getAppNameNavbar() != null
                        ? applicationProperties.getUi().getAppNameNavbar()
                        : applicationProperties.getUi().getAppName();
        return (defaultNavBar != null) ? defaultNavBar : "Stirling PDF";
    }

    @Bean(name = "enableAlphaFunctionality")
    public boolean enableAlphaFunctionality() {
        return applicationProperties.getSystem().getEnableAlphaFunctionality() != null
                ? applicationProperties.getSystem().getEnableAlphaFunctionality()
                : false;
    }

    @Bean(name = "rateLimit")
    public boolean rateLimit() {
        String rateLimit = System.getProperty("rateLimit");
        if (rateLimit == null) rateLimit = System.getenv("rateLimit");
        return (rateLimit != null) ? Boolean.valueOf(rateLimit) : false;
    }

    @Bean(name = "RunningInDocker")
    public boolean runningInDocker() {
        return Files.exists(Paths.get("/.dockerenv"));
    }

    @Bean(name = "configDirMounted")
    public boolean isRunningInDockerWithConfig() {
        Path dockerEnv = Paths.get("/.dockerenv");
        // default to true if not docker
        if (!Files.exists(dockerEnv)) {
            return true;
        }
        Path mountInfo = Paths.get("/proc/1/mountinfo");
        // this should always exist, if not some unknown usecase
        if (!Files.exists(mountInfo)) {
            return true;
        }
        try {
            return Files.lines(mountInfo).anyMatch(line -> line.contains(" /configs "));
        } catch (IOException e) {
            return false;
        }
    }

    @ConditionalOnMissingClass("stirling.software.SPDF.config.security.SecurityConfiguration")
    @Bean(name = "activeSecurity")
    public boolean missingActiveSecurity() {
        return false;
    }

    @Bean(name = "directoryFilter")
    public Predicate<Path> processOnlyFiles() {
        return path -> {
            if (Files.isDirectory(path)) {
                return !path.toString().contains("processing");
            } else {
                return true;
            }
        };
    }

    @Bean(name = "termsAndConditions")
    public String termsAndConditions() {
        return applicationProperties.getLegal().getTermsAndConditions();
    }

    @Bean(name = "privacyPolicy")
    public String privacyPolicy() {
        return applicationProperties.getLegal().getPrivacyPolicy();
    }

    @Bean(name = "cookiePolicy")
    public String cookiePolicy() {
        return applicationProperties.getLegal().getCookiePolicy();
    }

    @Bean(name = "impressum")
    public String impressum() {
        return applicationProperties.getLegal().getImpressum();
    }

    @Bean(name = "accessibilityStatement")
    public String accessibilityStatement() {
        return applicationProperties.getLegal().getAccessibilityStatement();
    }

    @Bean(name = "analyticsPrompt")
    @Scope("request")
    public boolean analyticsPrompt() {
        return applicationProperties.getSystem().getEnableAnalytics() == null;
    }

    @Bean(name = "analyticsEnabled")
    @Scope("request")
    public boolean analyticsEnabled() {
        if (applicationProperties.getPremium().isEnabled()) return true;
        return applicationProperties.getSystem().isAnalyticsEnabled();
    }

    @Bean(name = "StirlingPDFLabel")
    public String stirlingPDFLabel() {
        return "Stirling-PDF" + " v" + appVersion();
    }

    @Bean(name = "UUID")
    public String uuid() {
        return applicationProperties.getAutomaticallyGenerated().getUUID();
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/AppUpdateService.java
================================================
package stirling.software.SPDF.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

import stirling.software.SPDF.config.interfaces.ShowAdminInterface;
import stirling.software.SPDF.model.ApplicationProperties;

@Configuration
class AppUpdateService {

    private final ApplicationProperties applicationProperties;

    private final ShowAdminInterface showAdmin;

    public AppUpdateService(
            ApplicationProperties applicationProperties,
            @Autowired(required = false) ShowAdminInterface showAdmin) {
        this.applicationProperties = applicationProperties;
        this.showAdmin = showAdmin;
    }

    @Bean(name = "shouldShow")
    @Scope("request")
    public boolean shouldShow() {
        boolean showUpdate = applicationProperties.getSystem().isShowUpdate();
        boolean showAdminResult = (showAdmin != null) ? showAdmin.getShowUpdateOnlyAdmins() : true;
        return showUpdate && showAdminResult;
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/CleanUrlInterceptor.java
================================================
package stirling.software.SPDF.config;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CleanUrlInterceptor implements HandlerInterceptor {

    private static final List<String> ALLOWED_PARAMS =
            Arrays.asList(
                    "lang",
                    "endpoint",
                    "endpoints",
                    "logout",
                    "error",
                    "errorOAuth",
                    "file",
                    "messageType",
                    "infoMessage");

    @Override
    public boolean preHandle(
            HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String queryString = request.getQueryString();
        if (queryString != null && !queryString.isEmpty()) {
            String requestURI = request.getRequestURI();
            Map<String, String> allowedParameters = new HashMap<>();

            // Keep only the allowed parameters
            String[] queryParameters = queryString.split("&");
            for (String param : queryParameters) {
                String[] keyValuePair = param.split("=");
                if (keyValuePair.length != 2) {
                    continue;
                }
                if (ALLOWED_PARAMS.contains(keyValuePair[0])) {
                    allowedParameters.put(keyValuePair[0], keyValuePair[1]);
                }
            }

            // If there are any parameters that are not allowed
            if (allowedParameters.size() != queryParameters.length) {
                // Construct new query string
                StringBuilder newQueryString = new StringBuilder();
                for (Map.Entry<String, String> entry : allowedParameters.entrySet()) {
                    if (newQueryString.length() > 0) {
                        newQueryString.append("&");
                    }
                    newQueryString.append(entry.getKey()).append("=").append(entry.getValue());
                }

                // Redirect to the URL with only allowed query parameters
                String redirectUrl = requestURI + "?" + newQueryString;

                response.sendRedirect(request.getContextPath() + redirectUrl);
                return false;
            }
        }
        return true;
    }

    @Override
    public void postHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            ModelAndView modelAndView) {}

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception ex) {}
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/ConfigInitializer.java
================================================
package stirling.software.SPDF.config;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

/**
 * A naive, line-based approach to merging "settings.yml" with "settings.yml.template" while
 * preserving exact whitespace, blank lines, and inline comments -- but we only rewrite the file if
 * the merged content actually differs.
 */
@Slf4j
public class ConfigInitializer {

    public void ensureConfigExists() throws IOException, URISyntaxException {
        // 1) If settings file doesn't exist, create from template
        Path destPath = Paths.get(InstallationPathConfig.getSettingsPath());
        if (Files.notExists(destPath)) {
            Files.createDirectories(destPath.getParent());
            try (InputStream in =
                    getClass().getClassLoader().getResourceAsStream("settings.yml.template")) {
                if (in == null) {
                    throw new FileNotFoundException(
                            "Resource file not found: settings.yml.template");
                }
                Files.copy(in, destPath);
            }
            log.info("Created settings file from template");
        } else {
            // 2) Merge existing file with the template
            URL templateResource = getClass().getClassLoader().getResource("settings.yml.template");
            if (templateResource == null) {
                throw new IOException("Resource not found: settings.yml.template");
            }

            // Copy template to a temp location so we can read lines
            Path tempTemplatePath = Files.createTempFile("settings.yml", ".template");
            try (InputStream in = templateResource.openStream()) {
                Files.copy(in, tempTemplatePath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Copy setting.yaml to a temp location so we can read lines
            Path settingTempPath = Files.createTempFile("settings", ".yaml");
            try (InputStream in = Files.newInputStream(destPath)) {
                Files.copy(in, settingTempPath, StandardCopyOption.REPLACE_EXISTING);
            }

            YamlHelper settingsTemplateFile = new YamlHelper(tempTemplatePath);
            YamlHelper settingsFile = new YamlHelper(settingTempPath);

            migrateEnterpriseEditionToPremium(settingsFile, settingsTemplateFile);

            boolean changesMade =
                    settingsTemplateFile.updateValuesFromYaml(settingsFile, settingsTemplateFile);
            if (changesMade) {
                settingsTemplateFile.save(destPath);
                log.info("Settings file updated based on template changes.");
            } else {
                log.info("No changes detected; settings file left as-is.");
            }

            Files.deleteIfExists(tempTemplatePath);
            Files.deleteIfExists(settingTempPath);
        }

        // 3) Ensure custom settings file exists
        Path customSettingsPath = Paths.get(InstallationPathConfig.getCustomSettingsPath());
        if (Files.notExists(customSettingsPath)) {
            Files.createFile(customSettingsPath);
            log.info("Created custom_settings file: {}", customSettingsPath.toString());
        }
    }

    // TODO: Remove post migration
    private void migrateEnterpriseEditionToPremium(YamlHelper yaml, YamlHelper template) {
        if (yaml.getValueByExactKeyPath("enterpriseEdition", "enabled") != null) {
            template.updateValue(
                    List.of("premium", "enabled"),
                    yaml.getValueByExactKeyPath("enterpriseEdition", "enabled"));
        }
        if (yaml.getValueByExactKeyPath("enterpriseEdition", "key") != null) {
            template.updateValue(
                    List.of("premium", "key"),
                    yaml.getValueByExactKeyPath("enterpriseEdition", "key"));
        }
        if (yaml.getValueByExactKeyPath("enterpriseEdition", "SSOAutoLogin") != null) {
            template.updateValue(
                    List.of("premium", "proFeatures", "SSOAutoLogin"),
                    yaml.getValueByExactKeyPath("enterpriseEdition", "SSOAutoLogin"));
        }
        if (yaml.getValueByExactKeyPath("enterpriseEdition", "CustomMetadata", "autoUpdateMetadata")
                != null) {
            template.updateValue(
                    List.of("premium", "proFeatures", "CustomMetadata", "autoUpdateMetadata"),
                    yaml.getValueByExactKeyPath(
                            "enterpriseEdition", "CustomMetadata", "autoUpdateMetadata"));
        }
        if (yaml.getValueByExactKeyPath("enterpriseEdition", "CustomMetadata", "author") != null) {
            template.updateValue(
                    List.of("premium", "proFeatures", "CustomMetadata", "author"),
                    yaml.getValueByExactKeyPath("enterpriseEdition", "CustomMetadata", "author"));
        }
        if (yaml.getValueByExactKeyPath("enterpriseEdition", "CustomMetadata", "creator") != null) {
            template.updateValue(
                    List.of("premium", "proFeatures", "CustomMetadata", "creator"),
                    yaml.getValueByExactKeyPath("enterpriseEdition", "CustomMetadata", "creator"));
        }
        if (yaml.getValueByExactKeyPath("enterpriseEdition", "CustomMetadata", "producer")
                != null) {
            template.updateValue(
                    List.of("premium", "proFeatures", "CustomMetadata", "producer"),
                    yaml.getValueByExactKeyPath("enterpriseEdition", "CustomMetadata", "producer"));
        }
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/EndpointConfiguration.java
================================================
package stirling.software.SPDF.config;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import stirling.software.SPDF.model.ApplicationProperties;

@Service
@Slf4j
public class EndpointConfiguration {

    private static final String REMOVE_BLANKS = "remove-blanks";
    private final ApplicationProperties applicationProperties;
    private Map<String, Boolean> endpointStatuses = new ConcurrentHashMap<>();
    private Map<String, Set<String>> endpointGroups = new ConcurrentHashMap<>();
    private final boolean runningProOrHigher;

    public EndpointConfiguration(
            ApplicationProperties applicationProperties,
            @Qualifier("runningProOrHigher") boolean runningProOrHigher) {
        this.applicationProperties = applicationProperties;
        this.runningProOrHigher = runningProOrHigher;
        init();
        processEnvironmentConfigs();
    }

    public void enableEndpoint(String endpoint) {
        endpointStatuses.put(endpoint, true);
    }

    public void disableEndpoint(String endpoint) {
        if (!endpointStatuses.containsKey(endpoint) || endpointStatuses.get(endpoint) != false) {
            log.debug("Disabling {}", endpoint);
            endpointStatuses.put(endpoint, false);
        }
    }

    public Map<String, Boolean> getEndpointStatuses() {
        return endpointStatuses;
    }

    public boolean isEndpointEnabled(String endpoint) {
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.substring(1);
        }
        return endpointStatuses.getOrDefault(endpoint, true);
    }

    public boolean isGroupEnabled(String group) {
        Set<String> endpoints = endpointGroups.get(group);
        if (endpoints == null || endpoints.isEmpty()) {
            log.debug("Group '{}' does not exist or has no endpoints", group);
            return false;
        }

        for (String endpoint : endpoints) {
            if (!isEndpointEnabled(endpoint)) {
                return false;
            }
        }

        return true;
    }

    public void addEndpointToGroup(String group, String endpoint) {
        endpointGroups.computeIfAbsent(group, k -> new HashSet<>()).add(endpoint);
    }

    public void enableGroup(String group) {
        Set<String> endpoints = endpointGroups.get(group);
        if (endpoints != null) {
            for (String endpoint : endpoints) {
                enableEndpoint(endpoint);
            }
        }
    }

    public void disableGroup(String group) {
        Set<String> endpoints = endpointGroups.get(group);
        if (endpoints != null) {
            for (String endpoint : endpoints) {
                disableEndpoint(endpoint);
            }
        }
    }

    public void logDisabledEndpointsSummary() {
        List<String> disabledList =
                endpointStatuses.entrySet().stream()
                        .filter(entry -> !entry.getValue()) // only get disabled endpoints (value
                        // is false)
                        .map(Map.Entry::getKey)
                        .sorted()
                        .toList();

        if (!disabledList.isEmpty()) {
            log.info(
                    "Total disabled endpoints: {}. Disabled endpoints: {}",
                    disabledList.size(),
                    String.join(", ", disabledList));
        }
    }

    public void init() {
        // Adding endpoints to "PageOps" group
        addEndpointToGroup("PageOps", "remove-pages");
        addEndpointToGroup("PageOps", "merge-pdfs");
        addEndpointToGroup("PageOps", "split-pdfs");
        addEndpointToGroup("PageOps", "pdf-organizer");
        addEndpointToGroup("PageOps", "rotate-pdf");
        addEndpointToGroup("PageOps", "multi-page-layout");
        addEndpointToGroup("PageOps", "scale-pages");
        addEndpointToGroup("PageOps", "adjust-contrast");
        addEndpointToGroup("PageOps", "crop");
        addEndpointToGroup("PageOps", "auto-split-pdf");
        addEndpointToGroup("PageOps", "extract-page");
        addEndpointToGroup("PageOps", "pdf-to-single-page");
        addEndpointToGroup("PageOps", "split-by-size-or-count");
        addEndpointToGroup("PageOps", "overlay-pdf");
        addEndpointToGroup("PageOps", "split-pdf-by-sections");

        // Adding endpoints to "Convert" group
        addEndpointToGroup("Convert", "pdf-to-img");
        addEndpointToGroup("Convert", "img-to-pdf");
        addEndpointToGroup("Convert", "pdf-to-pdfa");
        addEndpointToGroup("Convert", "file-to-pdf");
        addEndpointToGroup("Convert", "pdf-to-word");
        addEndpointToGroup("Convert", "pdf-to-presentation");
        addEndpointToGroup("Convert", "pdf-to-text");
        addEndpointToGroup("Convert", "pdf-to-html");
        addEndpointToGroup("Convert", "pdf-to-xml");
        addEndpointToGroup("Convert", "html-to-pdf");
        addEndpointToGroup("Convert", "url-to-pdf");
        addEndpointToGroup("Convert", "markdown-to-pdf");
        addEndpointToGroup("Convert", "pdf-to-csv");
        addEndpointToGroup("Convert", "pdf-to-markdown");

        // Adding endpoints to "Security" group
        addEndpointToGroup("Security", "add-password");
        addEndpointToGroup("Security", "remove-password");
        addEndpointToGroup("Security", "change-permissions");
        addEndpointToGroup("Security", "add-watermark");
        addEndpointToGroup("Security", "cert-sign");
        addEndpointToGroup("Security", "remove-cert-sign");
        addEndpointToGroup("Security", "sanitize-pdf");
        addEndpointToGroup("Security", "auto-redact");
        addEndpointToGroup("Security", "redact");

        // Adding endpoints to "Other" group
        addEndpointToGroup("Other", "ocr-pdf");
        addEndpointToGroup("Other", "add-image");
        addEndpointToGroup("Other", "compress-pdf");
        addEndpointToGroup("Other", "extract-images");
        addEndpointToGroup("Other", "change-metadata");
        addEndpointToGroup("Other", "extract-image-scans");
        addEndpointToGroup("Other", "sign");
        addEndpointToGroup("Other", "flatten");
        addEndpointToGroup("Other", "repair");
        addEndpointToGroup("Other", "unlock-pdf-forms");
        addEndpointToGroup("Other", REMOVE_BLANKS);
        addEndpointToGroup("Other", "remove-annotations");
        addEndpointToGroup("Other", "compare");
        addEndpointToGroup("Other", "add-page-numbers");
        addEndpointToGroup("Other", "auto-rename");
        addEndpointToGroup("Other", "get-info-on-pdf");
        addEndpointToGroup("Other", "show-javascript");
        addEndpointToGroup("Other", "remove-image-pdf");

        // CLI
        addEndpointToGroup("CLI", "compress-pdf");
        addEndpointToGroup("CLI", "extract-image-scans");
        addEndpointToGroup("CLI", "repair");
        addEndpointToGroup("CLI", "pdf-to-pdfa");
        addEndpointToGroup("CLI", "file-to-pdf");
        addEndpointToGroup("CLI", "pdf-to-word");
        addEndpointToGroup("CLI", "pdf-to-presentation");
        addEndpointToGroup("CLI", "pdf-to-html");
        addEndpointToGroup("CLI", "pdf-to-xml");
        addEndpointToGroup("CLI", "ocr-pdf");
        addEndpointToGroup("CLI", "html-to-pdf");
        addEndpointToGroup("CLI", "url-to-pdf");
        addEndpointToGroup("CLI", "pdf-to-rtf");

        // python
        addEndpointToGroup("Python", "extract-image-scans");
        addEndpointToGroup("Python", "html-to-pdf");
        addEndpointToGroup("Python", "url-to-pdf");
        addEndpointToGroup("Python", "file-to-pdf");

        // openCV
        addEndpointToGroup("OpenCV", "extract-image-scans");

        // LibreOffice
        addEndpointToGroup("LibreOffice", "file-to-pdf");
        addEndpointToGroup("LibreOffice", "pdf-to-word");
        addEndpointToGroup("LibreOffice", "pdf-to-presentation");
        addEndpointToGroup("LibreOffice", "pdf-to-rtf");
        addEndpointToGroup("LibreOffice", "pdf-to-html");
        addEndpointToGroup("LibreOffice", "pdf-to-xml");
        addEndpointToGroup("LibreOffice", "pdf-to-pdfa");

        // Unoconvert
        addEndpointToGroup("Unoconvert", "file-to-pdf");

        addEndpointToGroup("tesseract", "ocr-pdf");

        // Java
        addEndpointToGroup("Java", "merge-pdfs");
        addEndpointToGroup("Java", "remove-pages");
        addEndpointToGroup("Java", "split-pdfs");
        addEndpointToGroup("Java", "pdf-organizer");
        addEndpointToGroup("Java", "rotate-pdf");
        addEndpointToGroup("Java", "pdf-to-img");
        addEndpointToGroup("Java", "img-to-pdf");
        addEndpointToGroup("Java", "add-password");
        addEndpointToGroup("Java", "remove-password");
        addEndpointToGroup("Java", "change-permissions");
        addEndpointToGroup("Java", "add-watermark");
        addEndpointToGroup("Java", "add-image");
        addEndpointToGroup("Java", "extract-images");
        addEndpointToGroup("Java", "change-metadata");
        addEndpointToGroup("Java", "cert-sign");
        addEndpointToGroup("Java", "remove-cert-sign");
        addEndpointToGroup("Java", "multi-page-layout");
        addEndpointToGroup("Java", "scale-pages");
        addEndpointToGroup("Java", "add-page-numbers");
        addEndpointToGroup("Java", "auto-rename");
        addEndpointToGroup("Java", "auto-split-pdf");
        addEndpointToGroup("Java", "sanitize-pdf");
        addEndpointToGroup("Java", "crop");
        addEndpointToGroup("Java", "get-info-on-pdf");
        addEndpointToGroup("Java", "extract-page");
        addEndpointToGroup("Java", "pdf-to-single-page");
        addEndpointToGroup("Java", "markdown-to-pdf");
        addEndpointToGroup("Java", "show-javascript");
        addEndpointToGroup("Java", "auto-redact");
        addEndpointToGroup("Java", "redact");
        addEndpointToGroup("Java", "pdf-to-csv");
        addEndpointToGroup("Java", "split-by-size-or-count");
        addEndpointToGroup("Java", "overlay-pdf");
        addEndpointToGroup("Java", "split-pdf-by-sections");
        addEndpointToGroup("Java", REMOVE_BLANKS);
        addEndpointToGroup("Java", "pdf-to-text");
        addEndpointToGroup("Java", "remove-image-pdf");
        addEndpointToGroup("Java", "pdf-to-markdown");

        // Javascript
        addEndpointToGroup("Javascript", "pdf-organizer");
        addEndpointToGroup("Javascript", "sign");
        addEndpointToGroup("Javascript", "compare");
        addEndpointToGroup("Javascript", "adjust-contrast");

        // qpdf dependent endpoints
        addEndpointToGroup("qpdf", "repair");

        // Weasyprint dependent endpoints
        addEndpointToGroup("Weasyprint", "html-to-pdf");
        addEndpointToGroup("Weasyprint", "url-to-pdf");
        addEndpointToGroup("Weasyprint", "markdown-to-pdf");

        // Pdftohtml dependent endpoints
        addEndpointToGroup("Pdftohtml", "pdf-to-html");
        addEndpointToGroup("Pdftohtml", "pdf-to-markdown");
    }

    private void processEnvironmentConfigs() {
        if (applicationProperties != null && applicationProperties.getEndpoints() != null) {
            List<String> endpointsToRemove = applicationProperties.getEndpoints().getToRemove();
            List<String> groupsToRemove = applicationProperties.getEndpoints().getGroupsToRemove();

            if (endpointsToRemove != null) {
                for (String endpoint : endpointsToRemove) {
                    disableEndpoint(endpoint.trim());
                }
            }

            if (groupsToRemove != null) {
                for (String group : groupsToRemove) {
                    disableGroup(group.trim());
                }
            }
        }
        if (!runningProOrHigher) {
            disableGroup("enterprise");
        }

        if (!applicationProperties.getSystem().getEnableUrlToPDF()) {
            disableEndpoint("url-to-pdf");
        }
    }

    public Set<String> getEndpointsForGroup(String group) {
        return endpointGroups.getOrDefault(group, new HashSet<>());
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/EndpointInspector.java
================================================
package stirling.software.SPDF.config;

import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EndpointInspector implements ApplicationListener<ContextRefreshedEvent> {
    private static final Logger logger = LoggerFactory.getLogger(EndpointInspector.class);

    private final ApplicationContext applicationContext;
    private final Set<String> validGetEndpoints = new HashSet<>();
    private boolean endpointsDiscovered = false;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (!endpointsDiscovered) {
            discoverEndpoints();
            endpointsDiscovered = true;
        }
    }

    private void discoverEndpoints() {
        try {
            Map<String, RequestMappingHandlerMapping> mappings =
                    applicationContext.getBeansOfType(RequestMappingHandlerMapping.class);

            for (Map.Entry<String, RequestMappingHandlerMapping> entry : mappings.entrySet()) {
                RequestMappingHandlerMapping mapping = entry.getValue();
                Map<RequestMappingInfo, HandlerMethod> handlerMethods = mapping.getHandlerMethods();

                for (Map.Entry<RequestMappingInfo, HandlerMethod> handlerEntry :
                        handlerMethods.entrySet()) {
                    RequestMappingInfo mappingInfo = handlerEntry.getKey();
                    HandlerMethod handlerMethod = handlerEntry.getValue();

                    boolean isGetHandler = false;
                    try {
                        Set<RequestMethod> methods = mappingInfo.getMethodsCondition().getMethods();
                        isGetHandler = methods.isEmpty() || methods.contains(RequestMethod.GET);
                    } catch (Exception e) {
                        isGetHandler = true;
                    }

                    if (isGetHandler) {
                        Set<String> patterns = extractPatternsUsingDirectPaths(mappingInfo);

                        if (patterns.isEmpty()) {
                            patterns = extractPatternsFromString(mappingInfo);
                        }

                        validGetEndpoints.addAll(patterns);
                    }
                }
            }

            if (validGetEndpoints.isEmpty()) {
                logger.warn("No endpoints discovered. Adding common endpoints as fallback.");
                validGetEndpoints.add("/");
                validGetEndpoints.add("/api/**");
                validGetEndpoints.add("/**");
            }
        } catch (Exception e) {
            logger.error("Error discovering endpoints", e);
        }
    }

    private Set<String> extractPatternsUsingDirectPaths(RequestMappingInfo mappingInfo) {
        Set<String> patterns = new HashSet<>();

        try {
            Method getDirectPathsMethod = mappingInfo.getClass().getMethod("getDirectPaths");
            Object result = getDirectPathsMethod.invoke(mappingInfo);
            if (result instanceof Set) {
                @SuppressWarnings("unchecked")
                Set<String> resultSet = (Set<String>) result;
                patterns.addAll(resultSet);
            }
        } catch (Exception e) {
            // Return empty set if method not found or fails
        }

        return patterns;
    }

    private Set<String> extractPatternsFromString(RequestMappingInfo mappingInfo) {
        Set<String> patterns = new HashSet<>();
        try {
            String infoString = mappingInfo.toString();
            if (infoString.contains("{")) {
                String patternsSection =
                        infoString.substring(infoString.indexOf("{") + 1, infoString.indexOf("}"));

                for (String pattern : patternsSection.split(",")) {
                    pattern = pattern.trim();
                    if (!pattern.isEmpty()) {
                        patterns.add(pattern);
                    }
                }
            }
        } catch (Exception e) {
            // Return empty set if parsing fails
        }
        return patterns;
    }

    public boolean isValidGetEndpoint(String uri) {
        if (!endpointsDiscovered) {
            discoverEndpoints();
            endpointsDiscovered = true;
        }

        if (validGetEndpoints.contains(uri)) {
            return true;
        }

        if (matchesWildcardOrPathVariable(uri)) {
            return true;
        }

        if (matchesPathSegments(uri)) {
            return true;
        }

        return false;
    }

    private boolean matchesWildcardOrPathVariable(String uri) {
        for (String pattern : validGetEndpoints) {
            if (pattern.contains("*") || pattern.contains("{")) {
                int wildcardIndex = pattern.indexOf('*');
                int variableIndex = pattern.indexOf('{');

                int cutoffIndex;
                if (wildcardIndex < 0) {
                    cutoffIndex = variableIndex;
                } else if (variableIndex < 0) {
                    cutoffIndex = wildcardIndex;
                } else {
                    cutoffIndex = Math.min(wildcardIndex, variableIndex);
                }

                String staticPrefix = pattern.substring(0, cutoffIndex);

                if (uri.startsWith(staticPrefix)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean matchesPathSegments(String uri) {
        for (String pattern : validGetEndpoints) {
            if (!pattern.contains("*") && !pattern.contains("{")) {
                String[] patternSegments = pattern.split("/");
                String[] uriSegments = uri.split("/");

                if (uriSegments.length < patternSegments.length) {
                    continue;
                }

                boolean match = true;
                for (int i = 0; i < patternSegments.length; i++) {
                    if (!patternSegments[i].equals(uriSegments[i])) {
                        match = false;
                        break;
                    }
                }

                if (match) {
                    return true;
                }
            }
        }
        return false;
    }

    public Set<String> getValidGetEndpoints() {
        if (!endpointsDiscovered) {
            discoverEndpoints();
            endpointsDiscovered = true;
        }
        return new HashSet<>(validGetEndpoints);
    }

    private void logAllEndpoints() {
        Set<String> sortedEndpoints = new TreeSet<>(validGetEndpoints);

        logger.info("=== BEGIN: All discovered GET endpoints ===");
        for (String endpoint : sortedEndpoints) {
            logger.info("Endpoint: {}", endpoint);
        }
        logger.info("=== END: All discovered GET endpoints ===");
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/EndpointInterceptor.java
================================================
package stirling.software.SPDF.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class EndpointInterceptor implements HandlerInterceptor {

    private final EndpointConfiguration endpointConfiguration;

    @Override
    public boolean preHandle(
            HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String requestURI = request.getRequestURI();
        boolean isEnabled;

        // Extract the specific endpoint name (e.g: /api/v1/general/remove-pages -> remove-pages)
        if (requestURI.contains("/api/v1") && requestURI.split("/").length > 4) {

            String[] requestURIParts = requestURI.split("/");
            String requestEndpoint;

            // Endpoint: /api/v1/convert/pdf/img becomes pdf-to-img
            if ("convert".equals(requestURIParts[3]) && requestURIParts.length > 5) {
                requestEndpoint = requestURIParts[4] + "-to-" + requestURIParts[5];
            } else {
                requestEndpoint = requestURIParts[4];
            }

            log.debug("Request endpoint: {}", requestEndpoint);
            isEnabled = endpointConfiguration.isEndpointEnabled(requestEndpoint);
            log.debug("Is endpoint enabled: {}", isEnabled);
        } else {
            isEnabled = endpointConfiguration.isEndpointEnabled(requestURI);
        }

        if (!isEnabled) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "This endpoint is disabled");
            return false;
        }
        return true;
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/EnterpriseEndpointFilter.java
================================================
package stirling.software.SPDF.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class EnterpriseEndpointFilter extends OncePerRequestFilter {
    private final boolean runningProOrHigher;

    public EnterpriseEndpointFilter(@Qualifier("runningProOrHigher") boolean runningProOrHigher) {
        this.runningProOrHigher = runningProOrHigher;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!runningProOrHigher && isPrometheusEndpointRequest(request)) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean isPrometheusEndpointRequest(HttpServletRequest request) {
        return request.getRequestURI().contains("/actuator/");
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/ExternalAppDepConfig.java
================================================
package stirling.software.SPDF.config;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class ExternalAppDepConfig {

    private final EndpointConfiguration endpointConfiguration;

    private final String weasyprintPath;
    private final String unoconvPath;
    private final Map<String, List<String>> commandToGroupMapping;

    public ExternalAppDepConfig(
            EndpointConfiguration endpointConfiguration, RuntimePathConfig runtimePathConfig) {
        this.endpointConfiguration = endpointConfiguration;
        weasyprintPath = runtimePathConfig.getWeasyPrintPath();
        unoconvPath = runtimePathConfig.getUnoConvertPath();

        commandToGroupMapping =
                new HashMap<>() {

                    {
                        put("soffice", List.of("LibreOffice"));
                        put(weasyprintPath, List.of("Weasyprint"));
                        put("pdftohtml", List.of("Pdftohtml"));
                        put(unoconvPath, List.of("Unoconvert"));
                        put("qpdf", List.of("qpdf"));
                        put("tesseract", List.of("tesseract"));
                    }
                };
    }

    private boolean isCommandAvailable(String command) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder();
            if (System.getProperty("os.name").toLowerCase().contains("windows")) {
                processBuilder.command("where", command);
            } else {
                processBuilder.command("which", command);
            }
            Process process = processBuilder.start();
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (Exception e) {
            log.debug("Error checking for command {}: {}", command, e.getMessage());
            return false;
        }
    }

    private List<String> getAffectedFeatures(String group) {
        return endpointConfiguration.getEndpointsForGroup(group).stream()
                .map(endpoint -> formatEndpointAsFeature(endpoint))
                .toList();
    }

    private String formatEndpointAsFeature(String endpoint) {
        // First replace common terms
        String feature = endpoint.replace("-", " ").replace("pdf", "PDF").replace("img", "image");
        // Split into words and capitalize each word
        return Arrays.stream(feature.split("\\s+"))
                .map(word -> capitalizeWord(word))
                .collect(Collectors.joining(" "));
    }

    private String capitalizeWord(String word) {
        if (word.isEmpty()) {
            return word;
        }
        if ("pdf".equalsIgnoreCase(word)) {
            return "PDF";
        }
        return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
    }

    private void checkDependencyAndDisableGroup(String command) {
        boolean isAvailable = isCommandAvailable(command);
        if (!isAvailable) {
            List<String> affectedGroups = commandToGroupMapping.get(command);
            if (affectedGroups != null) {
                for (String group : affectedGroups) {
                    List<String> affectedFeatures = getAffectedFeatures(group);
                    endpointConfiguration.disableGroup(group);
                    log.warn(
                            "Missing dependency: {} - Disabling group: {} (Affected features: {})",
                            command,
                            group,
                            affectedFeatures != null && !affectedFeatures.isEmpty()
                                    ? String.join(", ", affectedFeatures)
                                    : "unknown");
                }
            }
        }
    }

    @PostConstruct
    public void checkDependencies() {
        // Check core dependencies
        checkDependencyAndDisableGroup("tesseract");
        checkDependencyAndDisableGroup("soffice");
        checkDependencyAndDisableGroup("qpdf");
        checkDependencyAndDisableGroup(weasyprintPath);
        checkDependencyAndDisableGroup("pdftohtml");
        checkDependencyAndDisableGroup(unoconvPath);
        // Special handling for Python/OpenCV dependencies
        boolean pythonAvailable = isCommandAvailable("python3") || isCommandAvailable("python");
        if (!pythonAvailable) {
            List<String> pythonFeatures = getAffectedFeatures("Python");
            List<String> openCVFeatures = getAffectedFeatures("OpenCV");
            endpointConfiguration.disableGroup("Python");
            endpointConfiguration.disableGroup("OpenCV");
            log.warn(
                    "Missing dependency: Python - Disabling Python features: {} and OpenCV features: {}",
                    String.join(", ", pythonFeatures),
                    String.join(", ", openCVFeatures));
        } else {
            // If Python is available, check for OpenCV
            try {
                ProcessBuilder processBuilder = new ProcessBuilder();
                if (System.getProperty("os.name").toLowerCase().contains("windows")) {
                    processBuilder.command("python", "-c", "import cv2");
                } else {
                    processBuilder.command("python3", "-c", "import cv2");
                }
                Process process = processBuilder.start();
                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    List<String> openCVFeatures = getAffectedFeatures("OpenCV");
                    endpointConfiguration.disableGroup("OpenCV");
                    log.warn(
                            "OpenCV not available in Python - Disabling OpenCV features: {}",
                            String.join(", ", openCVFeatures));
                }
            } catch (Exception e) {
                List<String> openCVFeatures = getAffectedFeatures("OpenCV");
                endpointConfiguration.disableGroup("OpenCV");
                log.warn(
                        "Error checking OpenCV: {} - Disabling OpenCV features: {}",
                        e.getMessage(),
                        String.join(", ", openCVFeatures));
            }
        }
        endpointConfiguration.logDisabledEndpointsSummary();
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/FileFallbackTemplateResolver.java
================================================
package stirling.software.SPDF.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.thymeleaf.IEngineConfiguration;
import org.thymeleaf.templateresolver.AbstractConfigurableTemplateResolver;
import org.thymeleaf.templateresource.FileTemplateResource;
import org.thymeleaf.templateresource.ITemplateResource;

import stirling.software.SPDF.model.InputStreamTemplateResource;

public class FileFallbackTemplateResolver extends AbstractConfigurableTemplateResolver {

    private final ResourceLoader resourceLoader;

    public FileFallbackTemplateResolver(ResourceLoader resourceLoader) {
        super();
        this.resourceLoader = resourceLoader;
        setSuffix(".html");
    }

    // Note this does not work in local IDE, Prod jar only.
    @Override
    protected ITemplateResource computeTemplateResource(
            IEngineConfiguration configuration,
            String ownerTemplate,
            String template,
            String resourceName,
            String characterEncoding,
            Map<String, Object> templateResolutionAttributes) {
        Resource resource =
                resourceLoader.getResource(
                        "file:" + InstallationPathConfig.getTemplatesPath() + resourceName);
        try {
            if (resource.exists() && resource.isReadable()) {
                return new FileTemplateResource(resource.getFile().getPath(), characterEncoding);
            }
        } catch (IOException e) {

        }

        InputStream inputStream =
                Thread.currentThread()
                        .getContextClassLoader()
                        .getResourceAsStream("templates/" + resourceName);
        if (inputStream != null) {
            return new InputStreamTemplateResource(inputStream, "UTF-8");
        }
        return null;
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/InitialSetup.java
================================================
package stirling.software.SPDF.config;

import java.io.IOException;
import java.util.Properties;
import java.util.UUID;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import io.micrometer.common.util.StringUtils;

import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import stirling.software.SPDF.model.ApplicationProperties;
import stirling.software.SPDF.utils.GeneralUtils;

@Component
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@RequiredArgsConstructor
public class InitialSetup {

    private final ApplicationProperties applicationProperties;

    @PostConstruct
    public void init() throws IOException {
        initUUIDKey();
        initSecretKey();
        initEnableCSRFSecurity();
        initLegalUrls();
        initSetAppVersion();
    }

    public void initUUIDKey() throws IOException {
        String uuid = applicationProperties.getAutomaticallyGenerated().getUUID();
        if (!GeneralUtils.isValidUUID(uuid)) {
            // Generating a random UUID as the secret key
            uuid = UUID.randomUUID().toString();
            GeneralUtils.saveKeyToSettings("AutomaticallyGenerated.UUID", uuid);
            applicationProperties.getAutomaticallyGenerated().setUUID(uuid);
        }
    }

    public void initSecretKey() throws IOException {
        String secretKey = applicationProperties.getAutomaticallyGenerated().getKey();
        if (!GeneralUtils.isValidUUID(secretKey)) {
            // Generating a random UUID as the secret key
            secretKey = UUID.randomUUID().toString();
            GeneralUtils.saveKeyToSettings("AutomaticallyGenerated.key", secretKey);
            applicationProperties.getAutomaticallyGenerated().setKey(secretKey);
        }
    }

    public void initEnableCSRFSecurity() throws IOException {
        if (GeneralUtils.isVersionHigher(
                "0.36.0", applicationProperties.getAutomaticallyGenerated().getAppVersion())) {
            Boolean csrf = applicationProperties.getSecurity().getCsrfDisabled();
            if (!csrf) {
                GeneralUtils.saveKeyToSettings("security.csrfDisabled", false);
                GeneralUtils.saveKeyToSettings("system.enableAnalytics", true);
                applicationProperties.getSecurity().setCsrfDisabled(false);
            }
        }
    }

    public void initLegalUrls() throws IOException {
        // Initialize Terms and Conditions
        String termsUrl = applicationProperties.getLegal().getTermsAndConditions();
        if (StringUtils.isEmpty(termsUrl)) {
            String defaultTermsUrl = "https://www.stirlingpdf.com/terms-and-conditions";
            GeneralUtils.saveKeyToSettings("legal.termsAndConditions", defaultTermsUrl);
            applicationProperties.getLegal().setTermsAndConditions(defaultTermsUrl);
        }
        // Initialize Privacy Policy
        String privacyUrl = applicationProperties.getLegal().getPrivacyPolicy();
        if (StringUtils.isEmpty(privacyUrl)) {
            String defaultPrivacyUrl = "https://www.stirlingpdf.com/privacy-policy";
            GeneralUtils.saveKeyToSettings("legal.privacyPolicy", defaultPrivacyUrl);
            applicationProperties.getLegal().setPrivacyPolicy(defaultPrivacyUrl);
        }
    }

    public void initSetAppVersion() throws IOException {
        String appVersion = "0.0.0";
        Resource resource = new ClassPathResource("version.properties");
        Properties props = new Properties();
        try {
            props.load(resource.getInputStream());
            appVersion = props.getProperty("version");
        } catch (Exception e) {
        }
        GeneralUtils.saveKeyToSettings("AutomaticallyGenerated.appVersion", appVersion);
        applicationProperties.getAutomaticallyGenerated().setAppVersion(appVersion);
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/InstallationPathConfig.java
================================================
package stirling.software.SPDF.config;

import java.io.File;
import java.nio.file.Paths;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class InstallationPathConfig {
    private static final String BASE_PATH;

    // Root paths
    private static final String LOG_PATH;
    private static final String CONFIG_PATH;
    private static final String CUSTOM_FILES_PATH;
    private static final String CLIENT_WEBUI_PATH;

    // Config paths
    private static final String SETTINGS_PATH;
    private static final String CUSTOM_SETTINGS_PATH;

    // Custom file paths
    private static final String STATIC_PATH;
    private static final String TEMPLATES_PATH;
    private static final String SIGNATURES_PATH;

    static {
        BASE_PATH = initializeBasePath();

        // Initialize root paths
        LOG_PATH = BASE_PATH + "logs" + File.separator;
        CONFIG_PATH = BASE_PATH + "configs" + File.separator;
        CUSTOM_FILES_PATH = BASE_PATH + "customFiles" + File.separator;
        CLIENT_WEBUI_PATH = BASE_PATH + "clientWebUI" + File.separator;

        // Initialize config paths
        SETTINGS_PATH = CONFIG_PATH + "settings.yml";
        CUSTOM_SETTINGS_PATH = CONFIG_PATH + "custom_settings.yml";

        // Initialize custom file paths
        STATIC_PATH = CUSTOM_FILES_PATH + "static" + File.separator;
        TEMPLATES_PATH = CUSTOM_FILES_PATH + "templates" + File.separator;
        SIGNATURES_PATH = CUSTOM_FILES_PATH + "signatures" + File.separator;
    }

    private static String initializeBasePath() {
        if (Boolean.parseBoolean(System.getProperty("STIRLING_PDF_DESKTOP_UI", "false"))) {
            String os = System.getProperty("os.name").toLowerCase();
            if (os.contains("win")) {
                return Paths.get(
                                        System.getenv("APPDATA"), // parent path
                                        "Stirling-PDF")
                                .toString()
                        + File.separator;
            } else if (os.contains("mac")) {
                return Paths.get(
                                        System.getProperty("user.home"),
                                        "Library",
                                        "Application Support",
                                        "Stirling-PDF")
                                .toString()
                        + File.separator;
            } else {
                return Paths.get(
                                        System.getProperty("user.home"), // parent path
                                        ".config",
                                        "Stirling-PDF")
                                .toString()
                        + File.separator;
            }
        }
        return "." + File.separator;
    }

    public static String getPath() {
        return BASE_PATH;
    }

    public static String getLogPath() {
        return LOG_PATH;
    }

    public static String getConfigPath() {
        return CONFIG_PATH;
    }

    public static String getCustomFilesPath() {
        return CUSTOM_FILES_PATH;
    }

    public static String getClientWebUIPath() {
        return CLIENT_WEBUI_PATH;
    }

    public static String getSettingsPath() {
        return SETTINGS_PATH;
    }

    public static String getCustomSettingsPath() {
        return CUSTOM_SETTINGS_PATH;
    }

    public static String getStaticPath() {
        return STATIC_PATH;
    }

    public static String getTemplatesPath() {
        return TEMPLATES_PATH;
    }

    public static String getSignaturesPath() {
        return SIGNATURES_PATH;
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/LocaleConfiguration.java
================================================
package stirling.software.SPDF.config;

import java.util.Locale;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;

import lombok.RequiredArgsConstructor;

import stirling.software.SPDF.model.ApplicationProperties;

@Configuration
@RequiredArgsConstructor
public class LocaleConfiguration implements WebMvcConfigurer {

    private final ApplicationProperties applicationProperties;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
        registry.addInterceptor(new CleanUrlInterceptor());
    }

    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor lci = new LocaleChangeInterceptor();
        lci.setParamName("lang");
        return lci;
    }

    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver slr = new SessionLocaleResolver();
        String appLocaleEnv = applicationProperties.getSystem().getDefaultLocale();
        Locale defaultLocale = // Fallback to UK locale if environment variable is not set
                Locale.UK;
        if (appLocaleEnv != null && !appLocaleEnv.isEmpty()) {
            Locale tempLocale = Locale.forLanguageTag(appLocaleEnv);
            String tempLanguageTag = tempLocale.toLanguageTag();
            if (appLocaleEnv.equalsIgnoreCase(tempLanguageTag)) {
                defaultLocale = tempLocale;
            } else {
                tempLocale = Locale.forLanguageTag(appLocaleEnv.replace("_", "-"));
                tempLanguageTag = tempLocale.toLanguageTag();
                if (appLocaleEnv.equalsIgnoreCase(tempLanguageTag)) {
                    defaultLocale = tempLocale;
                } else {
                    System.err.println(
                            "Invalid SYSTEM_DEFAULTLOCALE environment variable value. Falling back to default en-GB.");
                }
            }
        }
        slr.setDefaultLocale(defaultLocale);
        return slr;
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/LogbackPropertyLoader.java
================================================
package stirling.software.SPDF.config;

import ch.qos.logback.core.PropertyDefinerBase;

public class LogbackPropertyLoader extends PropertyDefinerBase {
    @Override
    public String getPropertyValue() {
        return InstallationPathConfig.getLogPath();
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/MetricsConfig.java
================================================
package stirling.software.SPDF.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.micrometer.core.instrument.Meter;
import io.micrometer.core.instrument.config.MeterFilter;
import io.micrometer.core.instrument.config.MeterFilterReply;

@Configuration
public class MetricsConfig {

    @Bean
    public MeterFilter meterFilter() {
        return new MeterFilter() {
            @Override
            public MeterFilterReply accept(Meter.Id id) {
                if (id.getName().equals("http.requests")) {
                    return MeterFilterReply.NEUTRAL;
                }
                return MeterFilterReply.DENY;
            }
        };
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/MetricsFilter.java
================================================
package stirling.software.SPDF.config;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;

import stirling.software.SPDF.utils.RequestUriUtils;

@Component
@RequiredArgsConstructor
public class MetricsFilter extends OncePerRequestFilter {

    private final MeterRegistry meterRegistry;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();

        if (RequestUriUtils.isTrackableResource(request.getContextPath(), uri)) {
            HttpSession session = request.getSession(false);
            String sessionId = (session != null) ? session.getId() : "no-session";
            Counter counter =
                    Counter.builder("http.requests")
                            .tag("session", sessionId)
                            .tag("method", request.getMethod())
                            .tag("uri", uri)
                            .register(meterRegistry);

            counter.increment();
        }

        filterChain.doFilter(request, response);
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/OpenApiConfig.java
================================================
package stirling.software.SPDF.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

import lombok.RequiredArgsConstructor;

import stirling.software.SPDF.model.ApplicationProperties;

@Configuration
@RequiredArgsConstructor
public class OpenApiConfig {

    private final ApplicationProperties applicationProperties;

    private static final String DEFAULT_TITLE = "Stirling PDF API";
    private static final String DEFAULT_DESCRIPTION =
            "API documentation for all Server-Side processing.\n"
                    + "Please note some functionality might be UI only and missing from here.";

    @Bean
    public OpenAPI customOpenAPI() {
        String version = getClass().getPackage().getImplementationVersion();
        if (version == null) {
            // default version if all else fails
            version = "1.0.0";
        }
        if (!applicationProperties.getSecurity().getEnableLogin()) {
            return new OpenAPI()
                    .components(new Components())
                    .info(
                            new Info()
                                    .title(DEFAULT_TITLE)
                                    .version(version)
                                    .description(DEFAULT_DESCRIPTION));
        } else {
            SecurityScheme apiKeyScheme =
                    new SecurityScheme()
                            .type(SecurityScheme.Type.APIKEY)
                            .in(SecurityScheme.In.HEADER)
                            .name("X-API-KEY");
            return new OpenAPI()
                    .components(new Components().addSecuritySchemes("apiKey", apiKeyScheme))
                    .info(
                            new Info()
                                    .title(DEFAULT_TITLE)
                                    .version(version)
                                    .description(DEFAULT_DESCRIPTION))
                    .addSecurityItem(new SecurityRequirement().addList("apiKey"));
        }
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/PostHogConfig.java
================================================
package stirling.software.SPDF.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.posthog.java.PostHog;

import jakarta.annotation.PreDestroy;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class PostHogConfig {

    @Value("${posthog.api.key}")
    private String posthogApiKey;

    @Value("${posthog.host}")
    private String posthogHost;

    private PostHog postHogClient;

    @Bean
    public PostHog postHogClient() {
        postHogClient =
                new PostHog.Builder(posthogApiKey)
                        .host(posthogHost)
                        .logger(new PostHogLoggerImpl())
                        .build();
        return postHogClient;
    }

    @PreDestroy
    public void shutdownPostHog() {
        if (postHogClient != null) {
            postHogClient.shutdown();
        }
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/PostHogLoggerImpl.java
================================================
package stirling.software.SPDF.config;

import org.springframework.stereotype.Component;

import com.posthog.java.PostHogLogger;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class PostHogLoggerImpl implements PostHogLogger {

    @Override
    public void debug(String message) {
        log.debug(message);
    }

    @Override
    public void info(String message) {
        log.info(message);
    }

    @Override
    public void warn(String message) {
        log.warn(message);
    }

    @Override
    public void error(String message) {
        log.error(message);
    }

    @Override
    public void error(String message, Throwable throwable) {
        if (message.contains("Error sending events to PostHog")) {
            log.warn(
                    "Error sending metrics, Likely caused by no internet connection. Non Blocking");
        } else {
            log.error(message, throwable);
        }
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/RuntimePathConfig.java
================================================
package stirling.software.SPDF.config;

import java.nio.file.Files;
import java.nio.file.Path;

import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import stirling.software.SPDF.model.ApplicationProperties;
import stirling.software.SPDF.model.ApplicationProperties.CustomPaths.Operations;
import stirling.software.SPDF.model.ApplicationProperties.CustomPaths.Pipeline;

@Slf4j
@Configuration
@Getter
public class RuntimePathConfig {
    private final ApplicationProperties properties;
    private final String basePath;
    private final String weasyPrintPath;
    private final String unoConvertPath;

    // Pipeline paths
    private final String pipelineWatchedFoldersPath;
    private final String pipelineFinishedFoldersPath;
    private final String pipelineDefaultWebUiConfigs;
    private final String pipelinePath;

    public RuntimePathConfig(ApplicationProperties properties) {
        this.properties = properties;
        this.basePath = InstallationPathConfig.getPath();

        this.pipelinePath = Path.of(basePath, "pipeline").toString();
        String defaultWatchedFolders = Path.of(this.pipelinePath, "watchedFolders").toString();
        String defaultFinishedFolders = Path.of(this.pipelinePath, "finishedFolders").toString();
        String defaultWebUIConfigs = Path.of(this.pipelinePath, "defaultWebUIConfigs").toString();

        Pipeline pipeline = properties.getSystem().getCustomPaths().getPipeline();

        this.pipelineWatchedFoldersPath =
                resolvePath(
                        defaultWatchedFolders,
                        pipeline != null ? pipeline.getWatchedFoldersDir() : null);
        this.pipelineFinishedFoldersPath =
                resolvePath(
                        defaultFinishedFolders,
                        pipeline != null ? pipeline.getFinishedFoldersDir() : null);
        this.pipelineDefaultWebUiConfigs =
                resolvePath(
                        defaultWebUIConfigs,
                        pipeline != null ? pipeline.getWebUIConfigsDir() : null);

        boolean isDocker = isRunningInDocker();

        // Initialize Operation paths
        String defaultWeasyPrintPath = isDocker ? "/opt/venv/bin/weasyprint" : "weasyprint";
        String defaultUnoConvertPath = isDocker ? "/opt/venv/bin/unoconvert" : "unoconvert";

        Operations operations = properties.getSystem().getCustomPaths().getOperations();
        this.weasyPrintPath =
                resolvePath(
                        defaultWeasyPrintPath,
                        operations != null ? operations.getWeasyprint() : null);
        this.unoConvertPath =
                resolvePath(
                        defaultUnoConvertPath,
                        operations != null ? operations.getUnoconvert() : null);
    }

    private String resolvePath(String defaultPath, String customPath) {
        return StringUtils.isNotBlank(customPath) ? customPath : defaultPath;
    }

    private boolean isRunningInDocker() {
        return Files.exists(Path.of("/.dockerenv"));
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/StartupApplicationListener.java
================================================
package stirling.software.SPDF.config;

import java.time.LocalDateTime;

import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

@Component
public class StartupApplicationListener implements ApplicationListener<ContextRefreshedEvent> {

    public static LocalDateTime startTime;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        startTime = LocalDateTime.now();
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/WebMvcConfig.java
================================================
package stirling.software.SPDF.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final EndpointInterceptor endpointInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(endpointInterceptor);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Handler for external static resources
        registry.addResourceHandler("/**")
                .addResourceLocations(
                        "file:" + InstallationPathConfig.getStaticPath(), "classpath:/static/");
        // .setCachePeriod(0); // Optional: disable caching
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/YamlHelper.java
================================================
package stirling.software.SPDF.config;

import java.io.IOException;
import java.io.StringWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;

import org.snakeyaml.engine.v2.api.Dump;
import org.snakeyaml.engine.v2.api.DumpSettings;
import org.snakeyaml.engine.v2.api.LoadSettings;
import org.snakeyaml.engine.v2.api.StreamDataWriter;
import org.snakeyaml.engine.v2.common.FlowStyle;
import org.snakeyaml.engine.v2.common.ScalarStyle;
import org.snakeyaml.engine.v2.composer.Composer;
import org.snakeyaml.engine.v2.nodes.MappingNode;
import org.snakeyaml.engine.v2.nodes.Node;
import org.snakeyaml.engine.v2.nodes.NodeTuple;
import org.snakeyaml.engine.v2.nodes.ScalarNode;
import org.snakeyaml.engine.v2.nodes.SequenceNode;
import org.snakeyaml.engine.v2.nodes.Tag;
import org.snakeyaml.engine.v2.parser.ParserImpl;
import org.snakeyaml.engine.v2.scanner.StreamReader;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class YamlHelper {

    // YAML dump settings with comment support and block flow style
    private static final DumpSettings DUMP_SETTINGS =
            DumpSettings.builder()
                    .setDumpComments(true)
                    .setWidth(Integer.MAX_VALUE)
                    .setDefaultFlowStyle(FlowStyle.BLOCK)
                    .build();

    private final String yamlContent; // Stores the entire YAML content as a string

    private LoadSettings loadSettings =
            LoadSettings.builder()
                    .setUseMarks(true)
                    .setMaxAliasesForCollections(Integer.MAX_VALUE)
                    .setAllowRecursiveKeys(true)
                    .setParseComments(true)
                    .build();

    private Path originalFilePath;
    private Node updatedRootNode;

    // Constructor with custom LoadSettings and YAML string
    public YamlHelper(LoadSettings loadSettings, String yamlContent) {
        this.loadSettings = loadSettings;
        this.yamlContent = yamlContent;
    }

    // Constructor that reads YAML from a file path
    public YamlHelper(Path originalFilePath) throws IOException {
        this.yamlContent = Files.readString(originalFilePath);
        this.originalFilePath = originalFilePath;
    }

    /**
     * Updates values in the target YAML based on values from the source YAML. It ensures that only
     * existing keys in the target YAML are updated.
     *
     * @return true if at least one key was updated, false otherwise.
     */
    public boolean updateValuesFromYaml(YamlHelper sourceYaml, YamlHelper targetYaml) {
        boolean updated = false;
        Set<String> sourceKeys = sourceYaml.getAllKeys();
        Set<String> targetKeys = targetYaml.getAllKeys();

        for (String key : sourceKeys) {
            String[] keyArray = key.split("\\.");

            Object newValue = sourceYaml.getValueByExactKeyPath(keyArray);
            Object currentValue = targetYaml.getValueByExactKeyPath(keyArray);
            if (newValue != null
                    && (!newValue.equals(currentValue) || !sourceKeys.equals(targetKeys))) {
                boolean updatedKey = targetYaml.updateValue(Arrays.asList(keyArray), newValue);
                if (updatedKey) updated = true;
            }
        }

        return updated;
    }

    /**
     * Updates a value in the YAML structure.
     *
     * @param keys The hierarchical keys leading to the value.
     * @param newValue The new value to set.
     * @return true if the value was updated, false otherwise.
     */
    public boolean updateValue(List<String> keys, Object newValue) {
        return updateValue(getRootNode(), keys, newValue);
    }

    private boolean updateValue(Node node, List<String> keys, Object newValue) {
        if (!(node instanceof MappingNode mappingNode)) return false;

        List<NodeTuple> updatedTuples = new ArrayList<>();
        boolean updated = false;

        for (NodeTuple tuple : mappingNode.getValue()) {
            ScalarNode keyNode = (tuple.getKeyNode() instanceof ScalarNode sk) ? sk : null;
            if (keyNode == null || !keyNode.getValue().equals(keys.get(0))) {
                updatedTuples.add(tuple);
                continue;
            }

            Node valueNode = tuple.getValueNode();

            if (keys.size() == 1) {
                Tag tag = valueNode.getTag();
                Node newValueNode = null;

                if (isAnyInteger(newValue)) {
                    newValueNode =
                            new ScalarNode(Tag.INT, String.valueOf(newValue), ScalarStyle.PLAIN);
                } else if (isFloat(newValue)) {
                    Object floatValue = Float.valueOf(String.valueOf(newValue));
                    newValueNode =
                            new ScalarNode(
                                    Tag.FLOAT, String.valueOf(floatValue), ScalarStyle.PLAIN);
                } else if ("true".equals(newValue) || "false".equals(newValue)) {
                    newValueNode =
                            new ScalarNode(Tag.BOOL, String.valueOf(newValue), ScalarStyle.PLAIN);
                } else if (newValue instanceof List<?> list) {
                    List<Node> sequenceNodes = new ArrayList<>();
                    for (Object item : list) {
                        Object obj = String.valueOf(item);
                        if (isAnyInteger(item)) {
                            tag = Tag.INT;
                        } else if (isFloat(item)) {
                            obj = Float.valueOf(String.valueOf(item));
                            tag = Tag.FLOAT;
                        } else if ("true".equals(item) || "false".equals(item)) {
                            tag = Tag.BOOL;
                        } else if (item == null || "null".equals(item)) {
                            tag = Tag.NULL;
                        } else {
                            tag = Tag.STR;
                        }
                        sequenceNodes.add(
                                new ScalarNode(tag, String.valueOf(obj), ScalarStyle.PLAIN));
                    }
                    newValueNode = new SequenceNode(Tag.SEQ, sequenceNodes, FlowStyle.FLOW);
                } else if (tag == Tag.NULL) {
                    if ("true".equals(newValue)
                            || "false".equals(newValue)
                            || newValue instanceof Boolean) {
                        tag = Tag.BOOL;
                    }
                    newValueNode = new ScalarNode(tag, String.valueOf(newValue), ScalarStyle.PLAIN);
                } else {
                    newValueNode = new ScalarNode(tag, String.valueOf(newValue), ScalarStyle.PLAIN);
                }
                copyComments(valueNode, newValueNode);

                updatedTuples.add(new NodeTuple(keyNode, newValueNode));
                updated = true;
            } else if (valueNode instanceof MappingNode) {
                updated = updateValue(valueNode, keys.subList(1, keys.size()), newValue);
                updatedTuples.add(tuple);
            }
        }

        if (updated) {
            mappingNode.getValue().clear();
            mappingNode.getValue().addAll(updatedTuples);
        }
        setNewNode(node);

        return updated;
    }

    /**
     * Fetches a value based on an exact key path.
     *
     * @param keys The key hierarchy leading to the value.
     * @return The value if found, otherwise null.
     */
    public Object getValueByExactKeyPath(String... keys) {
        return getValueByExactKeyPath(getRootNode(), new ArrayDeque<>(List.of(keys)));
    }

    private Object getValueByExactKeyPath(Node node, Deque<String> keyQueue) {
        if (!(node instanceof MappingNode mappingNode)) return null;

        String currentKey = keyQueue.poll();
        if (currentKey == null) return null;

        for (NodeTuple tuple : mappingNode.getValue()) {
            if (tuple.getKeyNode() instanceof ScalarNode keyNode
                    && keyNode.getValue().equals(currentKey)) {
                if (keyQueue.isEmpty()) {
                    Node valueNode = tuple.getValueNode();

                    if (valueNode instanceof ScalarNode scalarValueNode) {
                        return scalarValueNode.getValue();
                    } else if (valueNode instanceof MappingNode subMapping) {
                        return getValueByExactKeyPath(subMapping, keyQueue);
                    } else if (valueNode instanceof SequenceNode sequenceNode) {
                        List<Object> valuesList = new ArrayList<>();
                        for (Node o : sequenceNode.getValue()) {
                            if (o instanceof ScalarNode scalarValue) {
                                valuesList.add(scalarValue.getValue());
                            }
                        }
                        return valuesList;
                    } else {
                        return null;
                    }
                }
                return getValueByExactKeyPath(tuple.getValueNode(), keyQueue);
            }
        }
        return null;
    }

    private Set<String> cachedKeys;

    /**
     * Retrieves the set of all keys present in the YAML structure. Keys are returned as
     * dot-separated paths for nested keys.
     *
     * @return A set containing all keys in dot notation.
     */
    public Set<String> getAllKeys() {
        if (cachedKeys == null) {
            cachedKeys = getAllKeys(getRootNode());
        }
        return cachedKeys;
    }

    /**
     * Collects all keys from the YAML node recursively.
     *
     * @param node The current YAML node.
     * @param currentPath The accumulated path of keys.
     * @param allKeys The set storing all collected keys.
     */
    private Set<String> getAllKeys(Node node) {
        Set<String> allKeys = new LinkedHashSet<>();
        collectKeys(node, "", allKeys);
        return allKeys;
    }

    /**
     * Recursively traverses the YAML structure to collect all keys.
     *
     * @param node The current node in the YAML structure.
     * @param currentPath The accumulated key path.
     * @param allKeys The set storing collected keys.
     */
    private void collectKeys(Node node, String currentPath, Set<String> allKeys) {
        if (node instanceof MappingNode mappingNode) {
            for (NodeTuple tuple : mappingNode.getValue()) {
                if (tuple.getKeyNode() instanceof ScalarNode keyNode) {
                    String newPath =
                            currentPath.isEmpty()
                                    ? keyNode.getValue()
                                    : currentPath + "." + keyNode.getValue();
                    allKeys.add(newPath);
                    collectKeys(tuple.getValueNode(), newPath, allKeys);
                }
            }
        }
    }

    /**
     * Retrieves the root node of the YAML document. If a new node was previously set, it is
     * returned instead.
     *
     * @return The root node of the YAML structure.
     */
    private Node getRootNode() {
        if (this.updatedRootNode != null) {
            return this.updatedRootNode;
        }
        Composer composer = new Composer(loadSettings, getParserImpl());
        Optional<Node> rootNodeOpt = composer.getSingleNode();
        if (rootNodeOpt.isPresent()) {
            return rootNodeOpt.get();
        }
        return null;
    }

    /**
     * Sets a new root node, allowing modifications to be tracked.
     *
     * @param newRootNode The modified root node.
     */
    public void setNewNode(Node newRootNode) {
        this.updatedRootNode = newRootNode;
    }

    /**
     * Retrieves the current root node (either the original or the updated one).
     *
     * @return The root node.
     */
    public Node getUpdatedRootNode() {
        if (this.updatedRootNode == null) {
            this.updatedRootNode = getRootNode();
        }
        return this.updatedRootNode;
    }

    /**
     * Initializes the YAML parser.
     *
     * @return The configured parser.
     */
    private ParserImpl getParserImpl() {
        return new ParserImpl(loadSettings, getStreamReader());
    }

    /**
     * Creates a stream reader for the YAML content.
     *
     * @return The configured stream reader.
     */
    private StreamReader getStreamReader() {
        return new StreamReader(loadSettings, yamlContent);
    }

    public MappingNode save(Path saveFilePath) throws IOException {
        if (!saveFilePath.equals(originalFilePath)) {
            Files.writeString(saveFilePath, convertNodeToYaml(getUpdatedRootNode()));
        }
        return (MappingNode) getUpdatedRootNode();
    }

    public void saveOverride(Path saveFilePath) throws IOException {
        Files.writeString(saveFilePath, convertNodeToYaml(getUpdatedRootNode()));
    }

    /**
     * Converts a YAML node back to a YAML-formatted string.
     *
     * @param rootNode The root node to be converted.
     * @return A YAML-formatted string.
     */
    public String convertNodeToYaml(Node rootNode) {
        StringWriter writer = new StringWriter();
        StreamDataWriter streamDataWriter =
                new StreamDataWriter() {
                    @Override
                    public void write(String str) {
                        writer.write(str);
                    }

                    @Override
                    public void write(String str, int off, int len) {
                        writer.write(str, off, len);
                    }
                };

        new Dump(DUMP_SETTINGS).dumpNode(rootNode, streamDataWriter);
        return writer.toString();
    }

    private static boolean isParsable(String value, Function<String, ?> parser) {
        try {
            parser.apply(value);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * Checks if a given object is an integer.
     *
     * @param object The object to check.
     * @return True if the object represents an integer, false otherwise.
     */
    @SuppressWarnings("UnnecessaryTemporaryOnConversionFromString")
    public static boolean isInteger(Object object) {
        if (object instanceof Integer
                || object instanceof Short
                || object instanceof Byte
                || object instanceof Long) {
            return true;
        }
        if (object instanceof String str) {
            return isParsable(str, Integer::parseInt);
        }
        return false;
    }

    /**
     * Checks if a given object is a floating-point number.
     *
     * @param object The object to check.
     * @return True if the object represents a float, false otherwise.
     */
    @SuppressWarnings("UnnecessaryTemporaryOnConversionFromString")
    public static boolean isFloat(Object object) {
        return (object instanceof Float || object instanceof Double)
                || (object instanceof String str && isParsable(str, Float::parseFloat));
    }

    /**
     * Checks if a given object is a short integer.
     *
     * @param object The object to check.
     * @return True if the object represents a short integer, false otherwise.
     */
    @SuppressWarnings("UnnecessaryTemporaryOnConversionFromString")
    public static boolean isShort(Object object) {
        return (object instanceof Long)
                || (object instanceof String str && isParsable(str, Short::parseShort));
    }

    /**
     * Checks if a given object is a byte.
     *
     * @param object The object to check.
     * @return True if the object represents a byte, false otherwise.
     */
    @SuppressWarnings("UnnecessaryTemporaryOnConversionFromString")
    public static boolean isByte(Object object) {
        return (object instanceof Long)
                || (object instanceof String str && isParsable(str, Byte::parseByte));
    }

    /**
     * Checks if a given object is a long integer.
     *
     * @param object The object to check.
     * @return True if the object represents a long integer, false otherwise.
     */
    @SuppressWarnings("UnnecessaryTemporaryOnConversionFromString")
    public static boolean isLong(Object object) {
        return (object instanceof Long)
                || (object instanceof String str && isParsable(str, Long::parseLong));
    }

    /**
     * Determines if an object is any type of integer (short, byte, long, or int).
     *
     * @param object The object to check.
     * @return True if the object represents an integer type, false otherwise.
     */
    public static boolean isAnyInteger(Object object) {
        return isInteger(object) || isShort(object) || isByte(object) || isLong(object);
    }

    /**
     * Copies comments from an old node to a new one.
     *
     * @param oldNode The original node with comments.
     * @param newValueNode The new node to which comments should be copied.
     */
    private void copyComments(Node oldNode, Node newValueNode) {
        if (oldNode == null || newValueNode == null) return;
        if (oldNode.getBlockComments() != null) {
            newValueNode.setBlockComments(oldNode.getBlockComments());
        }
        if (oldNode.getInLineComments() != null) {
            newValueNode.setInLineComments(oldNode.getInLineComments());
        }
        if (oldNode.getEndComments() != null) {
            newValueNode.setEndComments(oldNode.getEndComments());
        }
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/YamlPropertySourceFactory.java
================================================
package stirling.software.SPDF.config;

import java.io.IOException;
import java.util.Properties;

import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.core.io.support.PropertySourceFactory;

public class YamlPropertySourceFactory implements PropertySourceFactory {

    @Override
    public PropertySource<?> createPropertySource(String name, EncodedResource encodedResource)
            throws IOException {
        YamlPropertiesFactoryBean factory = new YamlPropertiesFactoryBean();
        factory.setResources(encodedResource.getResource());
        Properties properties = factory.getObject();

        return new PropertiesPropertySource(
                encodedResource.getResource().getFilename(), properties);
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/fingerprint/FingerprintBasedSessionFilter.java
================================================
// package stirling.software.SPDF.config.fingerprint;
//
// import java.io.IOException;
//
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Component;
// import org.springframework.web.filter.OncePerRequestFilter;
//
// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import jakarta.servlet.http.HttpSession;
// import lombok.extern.slf4j.Slf4j;
// import stirling.software.SPDF.utils.RequestUriUtils;
//
//// @Component
// @Slf4j
// public class FingerprintBasedSessionFilter extends OncePerRequestFilter {
//    private final FingerprintGenerator fingerprintGenerator;
//    private final FingerprintBasedSessionManager sessionManager;
//
//    @Autowired
//    public FingerprintBasedSessionFilter(
//            FingerprintGenerator fingerprintGenerator,
//            FingerprintBasedSessionManager sessionManager) {
//        this.fingerprintGenerator = fingerprintGenerator;
//        this.sessionManager = sessionManager;
//    }
//
//    @Override
//    protected void doFilterInternal(
//            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//            throws ServletException, IOException {
//
//        if (RequestUriUtils.isStaticResource(request.getContextPath(), request.getRequestURI())) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        String fingerprint = fingerprintGenerator.generateFingerprint(request);
//        log.debug("Generated fingerprint for request: {}", fingerprint);
//
//        HttpSession session = request.getSession();
//        boolean isNewSession = session.isNew();
//        String sessionId = session.getId();
//
//        if (isNewSession) {
//            log.info("New session created: {}", sessionId);
//        }
//
//        if (!sessionManager.isFingerPrintAllowed(fingerprint)) {
//            log.info("Blocked fingerprint detected, redirecting: {}", fingerprint);
//            response.sendRedirect(request.getContextPath() + "/too-many-requests");
//            return;
//        }
//
//        session.setAttribute("userFingerprint", fingerprint);
//        session.setAttribute(
//                FingerprintBasedSessionManager.STARTUP_TIMESTAMP,
//                FingerprintBasedSessionManager.APP_STARTUP_TIME);
//
//        sessionManager.registerFingerprint(fingerprint, sessionId);
//
//        log.debug("Proceeding with request: {}", request.getRequestURI());
//        filterChain.doFilter(request, response);
//    }
// }



================================================
FILE: src/main/java/stirling/software/SPDF/config/fingerprint/FingerprintBasedSessionManager.java
================================================
// package stirling.software.SPDF.config.fingerprint;
//
// import java.util.Iterator;
// import java.util.Map;
// import java.util.concurrent.ConcurrentHashMap;
// import java.util.concurrent.TimeUnit;
//
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Component;
//
// import jakarta.servlet.http.HttpSession;
// import jakarta.servlet.http.HttpSessionAttributeListener;
// import jakarta.servlet.http.HttpSessionEvent;
// import jakarta.servlet.http.HttpSessionListener;
// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.extern.slf4j.Slf4j;
//
// @Slf4j
// @Component
// public class FingerprintBasedSessionManager
//        implements HttpSessionListener, HttpSessionAttributeListener {
//    private static final ConcurrentHashMap<String, FingerprintInfo> activeFingerprints =
//            new ConcurrentHashMap<>();
//
//    // To be reduced in later version to 8~
//    private static final int MAX_ACTIVE_FINGERPRINTS = 30;
//
//    static final String STARTUP_TIMESTAMP = "appStartupTimestamp";
//    static final long APP_STARTUP_TIME = System.currentTimeMillis();
//    private static final long FINGERPRINT_EXPIRATION = TimeUnit.MINUTES.toMillis(30);
//
//    @Override
//    public void sessionCreated(HttpSessionEvent se) {
//        HttpSession session = se.getSession();
//        String sessionId = session.getId();
//        String fingerprint = (String) session.getAttribute("userFingerprint");
//
//        if (fingerprint == null) {
//            log.warn("Session created without fingerprint: {}", sessionId);
//            return;
//        }
//
//        synchronized (activeFingerprints) {
//            if (activeFingerprints.size() >= MAX_ACTIVE_FINGERPRINTS
//                    && !activeFingerprints.containsKey(fingerprint)) {
//                log.info("Max fingerprints reached. Marking session as blocked: {}", sessionId);
//                session.setAttribute("blocked", true);
//            } else {
//                activeFingerprints.put(
//                        fingerprint, new FingerprintInfo(sessionId, System.currentTimeMillis()));
//                log.info(
//                        "New fingerprint registered: {}. Total active fingerprints: {}",
//                        fingerprint,
//                        activeFingerprints.size());
//            }
//            session.setAttribute(STARTUP_TIMESTAMP, APP_STARTUP_TIME);
//        }
//    }
//
//    @Override
//    public void sessionDestroyed(HttpSessionEvent se) {
//        HttpSession session = se.getSession();
//        String fingerprint = (String) session.getAttribute("userFingerprint");
//
//        if (fingerprint != null) {
//            synchronized (activeFingerprints) {
//                activeFingerprints.remove(fingerprint);
//                log.info(
//                        "Fingerprint removed: {}. Total active fingerprints: {}",
//                        fingerprint,
//                        activeFingerprints.size());
//            }
//        }
//    }
//
//    public boolean isFingerPrintAllowed(String fingerprint) {
//        synchronized (activeFingerprints) {
//            return activeFingerprints.size() < MAX_ACTIVE_FINGERPRINTS
//                    || activeFingerprints.containsKey(fingerprint);
//        }
//    }
//
//    public void registerFingerprint(String fingerprint, String sessionId) {
//        synchronized (activeFingerprints) {
//            activeFingerprints.put(
//                    fingerprint, new FingerprintInfo(sessionId, System.currentTimeMillis()));
//        }
//    }
//
//    public void unregisterFingerprint(String fingerprint) {
//        synchronized (activeFingerprints) {
//            activeFingerprints.remove(fingerprint);
//        }
//    }
//
//    @Scheduled(fixedRate = 1800000) // Run every 30 mins
//    public void cleanupStaleFingerprints() {
//        log.info("Starting cleanup of stale fingerprints");
//        long now = System.currentTimeMillis();
//        int removedCount = 0;
//
//        synchronized (activeFingerprints) {
//            Iterator<Map.Entry<String, FingerprintInfo>> iterator =
//                    activeFingerprints.entrySet().iterator();
//            while (iterator.hasNext()) {
//                Map.Entry<String, FingerprintInfo> entry = iterator.next();
//                FingerprintInfo info = entry.getValue();
//
//                if (now - info.getLastAccessTime() > FINGERPRINT_EXPIRATION) {
//                    iterator.remove();
//                    removedCount++;
//                    log.info("Removed stale fingerprint: {}", entry.getKey());
//                }
//            }
//        }
//
//        log.info("Cleanup complete. Removed {} stale fingerprints", removedCount);
//    }
//
//    public void updateLastAccessTime(String fingerprint) {
//        FingerprintInfo info = activeFingerprints.get(fingerprint);
//        if (info != null) {
//            info.setLastAccessTime(System.currentTimeMillis());
//        }
//    }
//
//    @Data
//    @AllArgsConstructor
//    private static class FingerprintInfo {
//        private String sessionId;
//        private long lastAccessTime;
//    }
// }



================================================
FILE: src/main/java/stirling/software/SPDF/config/fingerprint/FingerprintGenerator.java
================================================
// package stirling.software.SPDF.config.fingerprint;
//
// import java.security.MessageDigest;
// import java.security.NoSuchAlgorithmException;
//
// import org.springframework.stereotype.Component;
//
// import jakarta.servlet.http.HttpServletRequest;
//
// @Component
// public class FingerprintGenerator {
//
//    public String generateFingerprint(HttpServletRequest request) {
//        if (request == null) {
//            return "";
//        }
//        StringBuilder fingerprintBuilder = new StringBuilder();
//
//        // Add IP address
//        fingerprintBuilder.append(request.getRemoteAddr());
//
//        // Add X-Forwarded-For header if present (for clients behind proxies)
//        String forwardedFor = request.getHeader("X-Forwarded-For");
//        if (forwardedFor != null) {
//            fingerprintBuilder.append(forwardedFor);
//        }
//
//        // Add User-Agent
//        String userAgent = request.getHeader("User-Agent");
//        if (userAgent != null) {
//            fingerprintBuilder.append(userAgent);
//        }
//
//        // Add Accept-Language header
//        String acceptLanguage = request.getHeader("Accept-Language");
//        if (acceptLanguage != null) {
//            fingerprintBuilder.append(acceptLanguage);
//        }
//
//        // Add Accept header
//        String accept = request.getHeader("Accept");
//        if (accept != null) {
//            fingerprintBuilder.append(accept);
//        }
//
//        // Add Connection header
//        String connection = request.getHeader("Connection");
//        if (connection != null) {
//            fingerprintBuilder.append(connection);
//        }
//
//        // Add server port
//        fingerprintBuilder.append(request.getServerPort());
//
//        // Add secure flag
//        fingerprintBuilder.append(request.isSecure());
//
//        // Generate a hash of the fingerprint
//        return generateHash(fingerprintBuilder.toString());
//    }
//
//    private String generateHash(String input) {
//        try {
//            MessageDigest digest = MessageDigest.getInstance("SHA-256");
//            byte[] hash = digest.digest(input.getBytes());
//            StringBuilder hexString = new StringBuilder();
//            for (byte b : hash) {
//                String hex = Integer.toHexString(0xff & b);
//                if (hex.length() == 1) hexString.append('0');
//                hexString.append(hex);
//            }
//            return hexString.toString();
//        } catch (NoSuchAlgorithmException e) {
//            throw new RuntimeException("Failed to generate fingerprint hash", e);
//        }
//    }
// }



================================================
FILE: src/main/java/stirling/software/SPDF/config/interfaces/DatabaseInterface.java
================================================
package stirling.software.SPDF.config.interfaces;

import java.sql.SQLException;
import java.util.List;

import stirling.software.SPDF.model.exception.UnsupportedProviderException;
import stirling.software.SPDF.utils.FileInfo;

public interface DatabaseInterface {
    void exportDatabase() throws SQLException, UnsupportedProviderException;

    void importDatabase();

    boolean hasBackup();

    List<FileInfo> getBackupList();
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/interfaces/ShowAdminInterface.java
================================================
package stirling.software.SPDF.config.interfaces;

public interface ShowAdminInterface {
    default boolean getShowUpdateOnlyAdmins() {
        return true;
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/security/AppUpdateAuthService.java
================================================
package stirling.software.SPDF.config.security;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import stirling.software.SPDF.config.interfaces.ShowAdminInterface;
import stirling.software.SPDF.model.ApplicationProperties;
import stirling.software.SPDF.model.User;
import stirling.software.SPDF.repository.UserRepository;

@Service
@RequiredArgsConstructor
class AppUpdateAuthService implements ShowAdminInterface {

    private final UserRepository userRepository;

    private final ApplicationProperties applicationProperties;

    @Override
    public boolean getShowUpdateOnlyAdmins() {
        boolean showUpdate = applicationProperties.getSystem().isShowUpdate();
        if (!showUpdate) {
            return showUpdate;
        }
        boolean showUpdateOnlyAdmin = applicationProperties.getSystem().getShowUpdateOnlyAdmin();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return !showUpdateOnlyAdmin;
        }
        if ("anonymousUser".equalsIgnoreCase(authentication.getName())) {
            return !showUpdateOnlyAdmin;
        }
        Optional<User> user = userRepository.findByUsername(authentication.getName());
        if (user.isPresent() && showUpdateOnlyAdmin) {
            return "ROLE_ADMIN".equals(user.get().getRolesAsString());
        }
        return showUpdate;
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/security/CustomAuthenticationFailureHandler.java
================================================
package stirling.software.SPDF.config.security;

import java.io.IOException;
import java.util.Optional;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.extern.slf4j.Slf4j;

import stirling.software.SPDF.model.User;

@Slf4j
public class CustomAuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private LoginAttemptService loginAttemptService;

    private UserService userService;

    public CustomAuthenticationFailureHandler(
            final LoginAttemptService loginAttemptService, UserService userService) {
        this.loginAttemptService = loginAttemptService;
        this.userService = userService;
    }

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception)
            throws IOException, ServletException {

        if (exception instanceof DisabledException) {
            log.error("User is deactivated: ", exception);
            getRedirectStrategy().sendRedirect(request, response, "/logout?userIsDisabled=true");
            return;
        }

        String ip = request.getRemoteAddr();
        log.error("Failed login attempt from IP: {}", ip);

        if (exception instanceof LockedException) {
            getRedirectStrategy().sendRedirect(request, response, "/login?error=locked");
            return;
        }

        String username = request.getParameter("username");
        Optional<User> optUser = userService.findByUsernameIgnoreCase(username);

        if (username != null && optUser.isPresent() && !isDemoUser(optUser)) {
            log.info(
                    "Remaining attempts for user {}: {}",
                    username,
                    loginAttemptService.getRemainingAttempts(username));
            loginAttemptService.loginFailed(username);
            if (loginAttemptService.isBlocked(username) || exception instanceof LockedException) {
                getRedirectStrategy().sendRedirect(request, response, "/login?error=locked");
                return;
            }
        }
        if (exception instanceof BadCredentialsException
                || exception instanceof UsernameNotFoundException) {
            getRedirectStrategy().sendRedirect(request, response, "/login?error=badCredentials");
            return;
        }
        if (exception instanceof InternalAuthenticationServiceException
                || "Password must not be null".equalsIgnoreCase(exception.getMessage())) {
            getRedirectStrategy()
                    .sendRedirect(request, response, "/login?error=oauth2AuthenticationError");
            return;
        }

        super.onAuthenticationFailure(request, response, exception);
    }

    private boolean isDemoUser(Optional<User> user) {
        return user.isPresent()
                && user.get().getAuthorities().stream()
                        .anyMatch(authority -> "ROLE_DEMO_USER".equals(authority.getAuthority()));
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/security/CustomAuthenticationSuccessHandler.java
================================================
package stirling.software.SPDF.config.security;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.SavedRequest;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import lombok.extern.slf4j.Slf4j;

import stirling.software.SPDF.utils.RequestUriUtils;

@Slf4j
public class CustomAuthenticationSuccessHandler
        extends SavedRequestAwareAuthenticationSuccessHandler {

    private LoginAttemptService loginAttemptService;
    private UserService userService;

    public CustomAuthenticationSuccessHandler(
            LoginAttemptService loginAttemptService, UserService userService) {
        this.loginAttemptService = loginAttemptService;
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws ServletException, IOException {

        String userName = request.getParameter("username");
        if (userService.isUserDisabled(userName)) {
            getRedirectStrategy().sendRedirect(request, response, "/logout?userIsDisabled=true");
            return;
        }
        loginAttemptService.loginSucceeded(userName);

        // Get the saved request
        HttpSession session = request.getSession(false);
        SavedRequest savedRequest =
                (session != null)
                        ? (SavedRequest) session.getAttribute("SPRING_SECURITY_SAVED_REQUEST")
                        : null;

        if (savedRequest != null
                && !RequestUriUtils.isStaticResource(
                        request.getContextPath(), savedRequest.getRedirectUrl())) {
            // Redirect to the original destination
            super.onAuthenticationSuccess(request, response, authentication);
        } else {
            // Redirect to the root URL (considering context path)
            getRedirectStrategy().sendRedirect(request, response, "/");
        }

        // super.onAuthenticationSuccess(request, response, authentication);
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/security/CustomLogoutSuccessHandler.java
================================================
package stirling.software.SPDF.config.security;

import java.io.IOException;
import java.security.cert.X509Certificate;
import java.security.interfaces.RSAPrivateKey;
import java.util.ArrayList;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.saml2.provider.service.authentication.Saml2Authentication;
import org.springframework.security.web.authentication.logout.SimpleUrlLogoutSuccessHandler;

import com.coveo.saml.SamlClient;
import com.coveo.saml.SamlException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import stirling.software.SPDF.SPDFApplication;
import stirling.software.SPDF.config.security.saml2.CertificateUtils;
import stirling.software.SPDF.config.security.saml2.CustomSaml2AuthenticatedPrincipal;
import stirling.software.SPDF.model.ApplicationProperties;
import stirling.software.SPDF.model.ApplicationProperties.Security.OAUTH2;
import stirling.software.SPDF.model.ApplicationProperties.Security.SAML2;
import stirling.software.SPDF.model.provider.KeycloakProvider;
import stirling.software.SPDF.utils.UrlUtils;

@Slf4j
@RequiredArgsConstructor
public class CustomLogoutSuccessHandler extends SimpleUrlLogoutSuccessHandler {

    public static final String LOGOUT_PATH = "/login?logout=true";

    private final ApplicationProperties applicationProperties;

    @Override
    public void onLogoutSuccess(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException {
        if (!response.isCommitted()) {
            if (authentication != null) {
                if (authentication instanceof Saml2Authentication samlAuthentication) {
                    // Handle SAML2 logout redirection
                    getRedirect_saml2(request, response, samlAuthentication);
                } else if (authentication instanceof OAuth2AuthenticationToken oAuthToken) {
                    // Handle OAuth2 logout redirection
                    getRedirect_oauth2(request, response, oAuthToken);
                } else if (authentication instanceof UsernamePasswordAuthenticationToken) {
                    // Handle Username/Password logout
                    getRedirectStrategy().sendRedirect(request, response, LOGOUT_PATH);
                } else {
                    // Handle unknown authentication types
                    log.error(
                            "Authentication class unknown: {}",
                            authentication.getClass().getSimpleName());
                    getRedirectStrategy().sendRedirect(request, response, LOGOUT_PATH);
                }
            } else {
                // Redirect to login page after logout
                String path = checkForErrors(request);
                getRedirectStrategy().sendRedirect(request, response, path);
            }
        }
    }

    // Redirect for SAML2 authentication logout
    private void getRedirect_saml2(
            HttpServletRequest request,
            HttpServletResponse response,
            Saml2Authentication samlAuthentication)
            throws IOException {

        SAML2 samlConf = applicationProperties.getSecurity().getSaml2();
        String registrationId = samlConf.getRegistrationId();

        CustomSaml2AuthenticatedPrincipal principal =
                (CustomSaml2AuthenticatedPrincipal) samlAuthentication.getPrincipal();

        String nameIdValue = principal.name();

        try {
            // Read certificate from the resource
            Resource certificateResource = samlConf.getSpCert();
            X509Certificate certificate = CertificateUtils.readCertificate(certificateResource);

            List<X509Certificate> certificates = new ArrayList<>();
            certificates.add(certificate);

            // Construct URLs required for SAML configuration
            SamlClient samlClient = getSamlClient(registrationId, samlConf, certificates);

            // Read private key for service provider
            Resource privateKeyResource = samlConf.getPrivateKey();
            RSAPrivateKey privateKey = CertificateUtils.readPrivateKey(privateKeyResource);

            // Set service provider keys for the SamlClient
            samlClient.setSPKeys(certificate, privateKey);

            // Redirect to identity provider for logout
            samlClient.redirectToIdentityProvider(response, null, nameIdValue);
        } catch (Exception e) {
            log.error(
                    "Error retrieving logout URL from Provider {} for user {}",
                    samlConf.getProvider(),
                    nameIdValue,
                    e);
            getRedirectStrategy().sendRedirect(request, response, LOGOUT_PATH);
        }
    }

    // Redirect for OAuth2 authentication logout
    private void getRedirect_oauth2(
            HttpServletRequest request,
            HttpServletResponse response,
            OAuth2AuthenticationToken oAuthToken)
            throws IOException {
        String registrationId;
        OAUTH2 oauth = applicationProperties.getSecurity().getOauth2();
        String path = checkForErrors(request);

        String redirectUrl = UrlUtils.getOrigin(request) + "/login?" + path;
        registrationId = oAuthToken.getAuthorizedClientRegistrationId();

        // Redirect based on OAuth2 provider
        switch (registrationId.toLowerCase()) {
            case "keycloak" -> {
                KeycloakProvider keycloak = oauth.getClient().getKeycloak();

                boolean isKeycloak = !keycloak.getIssuer().isBlank();
                boolean isCustomOAuth = !oauth.getIssuer().isBlank();

                String logoutUrl = redirectUrl;

                if (isKeycloak) {
                    logoutUrl = keycloak.getIssuer();
                } else if (isCustomOAuth) {
                    logoutUrl = oauth.getIssuer();
                }
                if (isKeycloak || isCustomOAuth) {
                    logoutUrl +=
                            "/protocol/openid-connect/logout"
                                    + "?client_id="
                                    + oauth.getClientId()
                                    + "&post_logout_redirect_uri="
                                    + response.encodeRedirectURL(redirectUrl);
                    log.info("Redirecting to Keycloak logout URL: {}", logoutUrl);
                } else {
                    log.info(
                            "No redirect URL for {} available. Redirecting to default logout URL: {}",
                            registrationId,
                            logoutUrl);
                }
                response.sendRedirect(logoutUrl);
            }
            case "github", "google" -> {
                log.info(
                        "No redirect URL for {} available. Redirecting to default logout URL: {}",
                        registrationId,
                        redirectUrl);
                response.sendRedirect(redirectUrl);
            }
            default -> {
                log.info("Redirecting to default logout URL: {}", redirectUrl);
                response.sendRedirect(redirectUrl);
            }
        }
    }

    private static SamlClient getSamlClient(
            String registrationId, SAML2 samlConf, List<X509Certificate> certificates)
            throws SamlException {
        String serverUrl =
                SPDFApplication.getStaticBaseUrl() + ":" + SPDFApplication.getStaticPort();

        String relyingPartyIdentifier =
                serverUrl + "/saml2/service-provider-metadata/" + registrationId;

        String assertionConsumerServiceUrl = serverUrl + "/login/saml2/sso/" + registrationId;

        String idpSLOUrl = samlConf.getIdpSingleLogoutUrl();

        String idpIssuer = samlConf.getIdpIssuer();

        // Create SamlClient instance for SAML logout
        return new SamlClient(
                relyingPartyIdentifier,
                assertionConsumerServiceUrl,
                idpSLOUrl,
                idpIssuer,
                certificates,
                SamlClient.SamlIdpBinding.POST);
    }

    /**
     * Handles different error scenarios during logout. Will return a <code>String</code> containing
     * the error request parameter.
     *
     * @param request the user's <code>HttpServletRequest</code> request.
     * @return a <code>String</code> containing the error request parameter.
     */
    private String checkForErrors(HttpServletRequest request) {
        String errorMessage;
        String path = "logout=true";

        if (request.getParameter("oAuth2AuthenticationErrorWeb") != null) {
            path = "errorOAuth=userAlreadyExistsWeb";
        } else if ((errorMessage = request.getParameter("errorOAuth")) != null) {
            path = "errorOAuth=" + sanitizeInput(errorMessage);
        } else if (request.getParameter("oAuth2AutoCreateDisabled") != null) {
            path = "errorOAuth=oAuth2AutoCreateDisabled";
        } else if (request.getParameter("oAuth2AdminBlockedUser") != null) {
            path = "errorOAuth=oAuth2AdminBlockedUser";
        } else if (request.getParameter("userIsDisabled") != null) {
            path = "errorOAuth=userIsDisabled";
        } else if ((errorMessage = request.getParameter("error")) != null) {
            path = "errorOAuth=" + sanitizeInput(errorMessage);
        } else if (request.getParameter("badCredentials") != null) {
            path = "errorOAuth=badCredentials";
        }

        return path;
    }

    /**
     * Sanitize input to avoid potential security vulnerabilities. Will return a sanitised <code>
     * String</code>.
     *
     * @return a sanitised <code>String</code>
     */
    private String sanitizeInput(String input) {
        return input.replaceAll("[^a-zA-Z0-9 ]", "");
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/security/CustomUserDetailsService.java
================================================
package stirling.software.SPDF.config.security;

import java.util.Collection;
import java.util.Set;

import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import stirling.software.SPDF.model.Authority;
import stirling.software.SPDF.model.User;
import stirling.software.SPDF.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    private final LoginAttemptService loginAttemptService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(
                                () ->
                                        new UsernameNotFoundException(
                                                "No user found with username: " + username));
        if (loginAttemptService.isBlocked(username)) {
            throw new LockedException(
                    "Your account has been locked due to too many failed login attempts.");
        }
        if (!user.hasPassword()) {
            throw new IllegalArgumentException("Password must not be null");
        }
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.isEnabled(),
                true,
                true,
                true,
                getAuthorities(user.getAuthorities()));
    }

    private Collection<? extends GrantedAuthority> getAuthorities(Set<Authority> authorities) {
        return authorities.stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getAuthority()))
                .toList();
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/security/FirstLoginFilter.java
================================================
package stirling.software.SPDF.config.security;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import lombok.extern.slf4j.Slf4j;

import stirling.software.SPDF.model.User;
import stirling.software.SPDF.utils.RequestUriUtils;

@Slf4j
@Component
public class FirstLoginFilter extends OncePerRequestFilter {

    @Lazy private final UserService userService;

    public FirstLoginFilter(@Lazy UserService userService) {
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String method = request.getMethod();
        String requestURI = request.getRequestURI();
        String contextPath = request.getContextPath();
        // Check if the request is for static resources
        boolean isStaticResource = RequestUriUtils.isStaticResource(contextPath, requestURI);
        // If it's a static resource, just continue the filter chain and skip the logic below
        if (isStaticResource) {
            filterChain.doFilter(request, response);
            return;
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Optional<User> user = userService.findByUsernameIgnoreCase(authentication.getName());
            if ("GET".equalsIgnoreCase(method)
                    && user.isPresent()
                    && user.get().isFirstLogin()
                    && !(contextPath + "/change-creds").equals(requestURI)) {
                response.sendRedirect(contextPath + "/change-creds");
                return;
            }
        }
        if (log.isDebugEnabled()) {
            HttpSession session = request.getSession(true);
            SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm:ss");
            String creationTime = timeFormat.format(new Date(session.getCreationTime()));
            log.debug(
                    "Request Info - New: {}, creationTimeSession {}, ID:  {}, IP: {}, User-Agent: {}, Referer: {}, Request URL: {}",
                    session.isNew(),
                    creationTime,
                    session.getId(),
                    request.getRemoteAddr(),
                    request.getHeader("User-Agent"),
                    request.getHeader("Referer"),
                    request.getRequestURL().toString());
        }
        filterChain.doFilter(request, response);
    }
}



================================================
FILE: src/main/java/stirling/software/SPDF/config/security/InitialSecuritySetup.java
================================================
package stirling.software.SPDF.config.security;

import java.sql.SQLException;
import java.util.UUID;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import stirling.software.SPDF.config.interfaces.DatabaseInterface;
import stirling.software.SPDF.model.ApplicationProperties;
import stirling.software.SPDF.model.Role;
import stirling.software.SPDF.model.exception.UnsupportedProviderException;

@Slf4j
@Component
@RequiredArgsConstructor
public class InitialSecuritySetup {

    private final UserService userService;

    private final ApplicationProperties applicationProperties;

    private final DatabaseInterface databaseService;

    @PostConstruct
    public void init() {
        try {

            if (!userService.hasUsers()) {
                if (databaseService.hasBackup()) {
                    databaseService.importDatabase();
                } else {
                    initializeAdminUser();
                }
            }

            userService.migrateOauth2ToSSO();
            initializeInternalApiUser();
        } catch (IllegalArgumentException | SQLException | UnsupportedProviderException e) {
            log.error("Failed to initialize security setup.", e);
            System.exit(1);
        }
    }

    private void initializeAdminUser() throws SQLException, UnsupportedProviderException {
        String initialUsername =
                applicationProperties.getSecurity().getInitialLogin().getUsername();
        String initialPassword =
                applicationProperties.getSecurity().getInitialLog