const { React } = vendetta;
const { Forms, TextInput } = findByProps("Form", "FormSection");
const { storage } = vendetta.plugin;

export default function Settings() {
    const [value, setValue] = React.useState(storage.targetUserId || "");

    return (
        <Forms.Form>
            <Forms.FormSection title="Target User ID">
                <TextInput
                    value={value}
                    onChange={(v) => {
                        setValue(v);
                        storage.targetUserId = v;
                    }}
                    placeholder="Enter Discord User ID"
                />
            </Forms.FormSection>
        </Forms.Form>
    );
}
