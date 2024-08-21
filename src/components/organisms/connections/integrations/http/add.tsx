import React, { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { namespaces } from "@constants";
import { selectIntegrationHttp } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { LoggerService } from "@services";
import { httpBasicIntegrationSchema, httpBearerIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Button } from "@components/atoms";
import { Select } from "@components/molecules";
import { HttpBasicForm, HttpBearerForm } from "@components/organisms/connections/integrations/http";

export const HttpIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const { projectId } = useParams();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const [selectedConnectionType, setSelectedConnectionType] = useState<SingleValue<SelectOption>>({
		value: ConnectionAuthType.NoAuth,
		label: t("http.noAuth"),
	});
	const [isLoading] = useState(false);

	const formSchema = useMemo(() => {
		if (selectedConnectionType?.value === ConnectionAuthType.Basic) return httpBasicIntegrationSchema;
		if (selectedConnectionType?.value === ConnectionAuthType.Bearer) return httpBearerIntegrationSchema;
	}, [selectedConnectionType]);

	const methods = useForm({
		resolver: formSchema ? zodResolver(formSchema) : undefined,
		defaultValues: {
			username: "",
			password: "",
			token: "",
		},
	});

	const { handleSubmit } = methods;

	useEffect(() => {
		if (!connectionId) return;
		navigate(`/projects/${projectId}/connections`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const renderNoAuth = () => (
		<Button
			ariaLabel={t("buttons.saveConnection")}
			className="ml-auto w-fit bg-white px-3 font-medium hover:bg-gray-500 hover:text-white"
			disabled={isLoading}
			onClick={triggerParentFormSubmit}
		>
			{t("buttons.saveConnection")}
		</Button>
	);

	const renderConnectionFields = () => {
		switch (selectedConnectionType?.value) {
			case ConnectionAuthType.NoAuth:
				return renderNoAuth();
			case ConnectionAuthType.Basic:
				return <HttpBasicForm isLoading={isLoading} />;
			case ConnectionAuthType.Bearer:
				return <HttpBearerForm isLoading={isLoading} />;
			default:
				return null;
		}
	};

	const onSubmit = () => {
		if (connectionId) {
			addToast({ id: Date.now().toString(), message: tErrors("connectionExists"), type: "error" });
			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("connectionExistsExtended", { connectionId })}`
			);

			return;
		}
		triggerParentFormSubmit();
	};

	return (
		<FormProvider {...methods}>
			<form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					label={t("placeholders.connectionType")}
					onChange={setSelectedConnectionType}
					options={selectIntegrationHttp}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{renderConnectionFields()}
			</form>
		</FormProvider>
	);
};
