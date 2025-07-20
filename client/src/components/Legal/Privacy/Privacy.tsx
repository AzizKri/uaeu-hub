import styles from '../Legal.module.scss';

export default function Privacy() {

    return (
        <div className={styles.page}>
            <section>
                <h1>Privacy Policy</h1>
                <p>Effective 15th of February, 2025</p>

            </section>

            <section className={styles.body}>

                <p>
                    Welcome to UAEU Chat! Your privacy is important to us. This Privacy Policy explains how we collect,
                    use, disclose, and safeguard your information when you use our platform. Please read this privacy
                    policy carefully. If you do not agree with the terms of this privacy policy, please do not access
                    the platform.
                </p>

                <h3 id={"info-we-collect"}>Information We Collect</h3>

                <p>
                    We may collect information about you in a variety of ways. The information we may collect on the
                    Platform includes: </p>
                <ul>
                    <li>Personal Data: Personally identifiable information, such as your name, username, email address,
                        password, and demographic information (such as your age, gender, and interests), that you
                        voluntarily give to us when you register with the Platform or when you choose to participate in
                        various activities related to the Platform, such as posting, sending messages, and searching.
                    </li>
                    <li>User-Generated Content: All information, including text, images, videos, and other content that
                        you post, upload, or otherwise make available on the Platform. This includes metadata associated
                        with your content, such as when and where it was created.
                    </li>
                    <li>
                        Device and Usage Information: Information our servers automatically collect when you access the
                        Platform, such as your IP address, your browser type, your operating system, your access times,
                        and the pages you have viewed directly before and after accessing the Platform.
                    </li>
                    <li>
                        Location Data: We may collect information about the precise or approximate location of your
                        device if you give us permission to do so. You may disable this feature in your device's
                        settings.
                    </li>
                </ul>

                <h3 id={"how-info-collected"}>How Information is Collected</h3>

                <p>We use various methods to collect information from and about you, including through:</p>
                <ul>
                    <li>Direct Interactions: You may give us your identity, contact, and profile data by filling in
                        forms or by corresponding with us.
                    </li>
                    <li>Third Parties or Publicly Available Sources: We may receive personal data about you from various
                        third parties, such as analytics providers like Google Analytics or advertising networks.
                    </li>
                </ul>

                <h3 id={"use-personal-data"}>Use of Personal Information</h3>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and
                    customized experience. Specifically, we may use information collected about you via the Platform
                    to:</p>

                <ul>
                    <li>
                        Create and manage your account.
                    </li>
                    <li>
                        Deliver and improve our products and services.
                    </li>
                    <li>
                        Personalize your user experience and allow us to deliver the type of content and product
                        offerings in which you are most interested.
                    </li>
                    <li>
                        Monitor and analyze usage and trends to improve the functionality of the Platform.
                    </li>
                    <li>
                        Communicate with you about your account or our services, including responding to your comments
                        and questions.
                    </li>
                    <li>
                        Send you updates, security alerts, and support messages.
                    </li>
                    <li>
                        Enforce our terms, conditions, and policies.
                    </li>
                    <li>
                        Prevent fraudulent activity, spam, and other abusive activities.
                    </li>
                </ul>

                <h3 id={"sharing"}>Sharing of Personal Information</h3>

                <p>
                    We may share information we have collected about you in certain situations. Your information may be
                    disclosed as follows:
                </p>

                <ul>
                    <li>
                        By Law or to Protect Rights: If we believe the release of information about you is necessary to
                        respond to legal process, to investigate or remedy potential violations of our policies, or to
                        protect the rights, property, and safety of others, we may share your information as permitted
                        or required by any applicable law, rule, or regulation.
                    </li>
                    <li>
                        Third-Party Service Providers: We may share your information with third parties that perform
                        services for us or on our behalf, including data analysis, hosting services, customer service,
                        and marketing assistance.
                    </li>
                    <li>
                        Publicly Visible Information: Your username, profile picture, and any content you post are
                        visible to other users of the Platform. This information can be searched for by other users and
                        may be publicly distributed outside the Platform in perpetuity.
                    </li>
                    <li>
                        Business Transfers: We may share or transfer your information in connection with, or during
                        negotiations of, any merger, sale of company assets, financing, or acquisition of all or a
                        portion of our business to another company.
                    </li>
                </ul>

                <h3 id={"data-retention"}>Data Retention</h3>
                <p>
                    We retain personal information, such as device information, indefinitely for security and spam
                    prevention purposes.
                </p>

                <h3 id={"data-security"}>Data Security</h3>
                <p>
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse. Any information disclosed online is vulnerable to interception and misuse by unauthorized parties. Therefore, we cannot guarantee complete security if you provide personal information.
                </p>

                <ul>
                    <li>
                        Account Information: We retain your account information for as long as your account is active. If you choose to delete your account, we will delete this information, but we may retain some data as required by law or for legitimate business purposes, such as to prevent fraud.                        provide you services.
                    </li>
                    <li>
                        User-Generated Content: Content you post may remain on the Platform even after your account is deleted, though it may be anonymized.                    </li>
                </ul>

                <h3 id={"children-privacy"}>Children&apos;s Privacy</h3>
                <p>
                    UAEU Chat is not intended for use by children under the age of 13. We do not knowingly collect
                    personal information from children under 13. If we become aware that a child under 13 has provided
                    us with personal information, we will take steps to delete such information and terminate the
                    child's account. If you become aware that your child has provided us with personal information
                    without your consent, please contact us.
                </p>



            </section>
        </div>
    )
}
