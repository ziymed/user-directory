import app from 'flarum/app';
import Modal from 'flarum/components/Modal';
import Button from 'flarum/components/Button';

/**
 * The `EmailUserModal` component shows a modal dialog which allows admin
 * to send message to user.
 */
export default class EmailUserModal extends Modal {
    init() {
        super.init();

        this.loading = false;

        this.user = this.props.user;
        this.forAll = this.props.forAll;
        this.subject = m.prop(app.translator.trans('flagrow-user-directory.admin.modal_mail.default_subject')[0]);
        this.messageText = m.prop('');

        if (!this.forAll) {
            this.email = m.prop(this.user.email() || '');
            this.submitDisabled = !this.checkEmail(this.email());
        } else {
            this.submitDisabled = false;
        }
    }

    className() {
        return 'EmailUserModal Modal--large';
    }

    title() {
        var title = app.translator.trans('flagrow-user-directory.admin.modal_mail.title_text');
        if (this.forAll) {
            title += ' ' + app.translator.trans('flagrow-user-directory.admin.modal_mail.title_all_text');
        } else {
            title += ' ' + this.user.username() + ' (' + this.email() + ')';
        }
        return title;
    }

    content() {
        return <div className="Modal-body">
            <form className="Form" onsubmit={this.onsubmit.bind(this)}>
                {!this.forAll && <div className="Form-group">
                    <label>{app.translator.trans('flagrow-user-directory.admin.modal_mail.email_label')}</label>
                    <input type="text" className="FormControl" value={this.email()} oninput={this.oninputEmail.bind(this)}/>
                </div>}

                <div className="Form-group">
                    <label>{app.translator.trans('flagrow-user-directory.admin.modal_mail.subject_label')}</label>
                    <input type="text" className="FormControl" bidi={this.subject} />
                </div>

                <div className="Form-group">
                    <label>{app.translator.trans('flagrow-user-directory.admin.modal_mail.message_label')}</label>
                    <textarea rows="10" className="FormControl" style="resize: vertical; width: 100%;" bidi={this.messageText}></textarea>
                </div>

                {Button.component({
                    type: 'submit',
                    className: 'Button Button--primary EditContactModal-save',
                    loading: this.loading,
                    children: app.translator.trans('flagrow-user-directory.admin.modal_mail.submit_button'),
                    disabled: this.submitDisabled
                })}
            </form>
        </div>
    }

    oninputEmail(value) {
        this.email(value);
        this.submitDisabled = !this.checkEmail(value);
    }

    checkEmail(email) {
        const emailRegexp = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

        var correct = true;
        var emails = this.splitEmails(email);
        emails.forEach(function (email) {
                if (!emailRegexp.test(email)) {
                    correct = false;
                }
            }
        );
        return correct;
    }

    splitEmails(email) {
        email = email.replace(/\s*/g,'');
        return email.split(',');
    }

    onsubmit(e) {
        e.preventDefault();

        this.loading = true;

        var data = {
            emails: this.forAll ? [] : this.splitEmails(this.email()),
            subject: this.subject(),
            text: this.messageText(),
            forAll: !!this.forAll
        };

        app.request({
            method: 'POST',
            url: app.forum.attribute('apiUrl') + '/admin-mail',
            data: {data}
        }).then(
            () => {
                this.hide();
            },
            response => {
                this.loading = false;
                this.onerror(response);
            }
        );
    }
}
