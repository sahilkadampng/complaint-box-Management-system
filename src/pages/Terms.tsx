import LegalLayout from "../components/LegalLayout";

export default function Terms() {
    return (
        <LegalLayout title="Terms & Conditions" updated="January 2026">
            <section>
                <h2 className="text-xl font-medium text-slate-900">
                    1. Introduction
                </h2>
                <p className="mt-2">
                    These Terms and Conditions govern your access to and use of our
                    platform. By using our services, you agree to these terms.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-medium text-slate-900">
                    2. Use of Service
                </h2>
                <p className="mt-2">
                    You agree to use the service only for lawful purposes and in a manner
                    that does not infringe the rights of others.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-medium text-slate-900">
                    3. User Responsibilities
                </h2>
                <p className="mt-2">
                    You are responsible for maintaining the confidentiality of your
                    account and for all activities under your account.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-medium text-slate-900">
                    4. Limitation of Liability
                </h2>
                <p className="mt-2">
                    We are not liable for any indirect or consequential damages arising
                    from the use of our services.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-medium text-slate-900">
                    5. Contact
                </h2>
                <p className="mt-2">
                    If you have questions about these terms, please contact us.
                </p>
            </section>
        </LegalLayout>
    );
}
