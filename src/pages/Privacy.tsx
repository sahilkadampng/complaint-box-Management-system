import LegalLayout from "../components/LegalLayout";

export default function Privacy() {
    return (
        <LegalLayout title="Privacy Policy" updated="January 2026">
            <section>
                <h2 className="text-xl font-medium text-slate-900">
                    1. Information We Collect
                </h2>
                <p className="mt-2">
                    We collect personal information such as your name and email address
                    when you use our services.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-medium text-slate-900">
                    2. How We Use Information
                </h2>
                <p className="mt-2">
                    Information is used to provide and improve our services and to
                    communicate with users.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-medium text-slate-900">
                    3. Data Protection
                </h2>
                <p className="mt-2">
                    We take reasonable measures to protect your data from unauthorized
                    access.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-medium text-slate-900">
                    4. Cookies
                </h2>
                <p className="mt-2">
                    Cookies help us understand usage patterns and improve user experience.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-medium text-slate-900">
                    5. Contact
                </h2>
                <p className="mt-2">
                    Contact us if you have any privacy-related concerns.
                </p>
            </section>
        </LegalLayout>
    );
}
